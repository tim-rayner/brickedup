import type { Gender, InterestedIn, LegoTheme } from '@repo/domain';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { TextField } from '@/components/ui/text-field';
import { OnboardingShell } from '@/features/onboarding/components/onboarding-shell';
import { THEME_OPTIONS } from '@/features/onboarding/theme-labels';
import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';
import {
  reverseGeocode,
  saveOnboarding,
  searchPlaces,
  type PlaceResult,
} from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

type TopSetDraft = { setNumber: string; name: string };

export default function OnboardingScreen() {
  const { refreshBootstrap } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [displayName, setDisplayName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);

  // Step 2
  const [interestedIn, setInterestedIn] = useState<InterestedIn>('both');
  const [minAge, setMinAge] = useState('21');
  const [maxAge, setMaxAge] = useState('45');
  const [maxDistanceKm, setMaxDistanceKm] = useState('50');

  // Step 3
  const [galleryUris, setGalleryUris] = useState<string[]>([]);
  const [collectionUri, setCollectionUri] = useState<string | null>(null);

  // Step 4
  const [themes, setThemes] = useState<LegoTheme[]>([]);

  // Step 5
  const [topSets, setTopSets] = useState<TopSetDraft[]>([{ setNumber: '', name: '' }]);

  // Step 6
  const [displayLocation, setDisplayLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [bio, setBio] = useState('');
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [placeLoading, setPlaceLoading] = useState(false);

  useEffect(() => {
    if (step !== 6 || placeQuery.trim().length < 2) {
      return;
    }
    let cancelled = false;
    const handle = setTimeout(async () => {
      setPlaceLoading(true);
      try {
        const { results } = await searchPlaces(placeQuery.trim());
        if (!cancelled) setPlaceResults(results);
      } catch {
        if (!cancelled) setPlaceResults([]);
      } finally {
        if (!cancelled) setPlaceLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [placeQuery, step]);

  const visiblePlaceResults = step === 6 && placeQuery.trim().length >= 2 ? placeResults : [];

  const nextDisabled = useMemo(() => {
    if (step === 1) {
      return !displayName.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) || !gender;
    }
    if (step === 2) {
      const min = Number(minAge);
      const max = Number(maxAge);
      const dist = Number(maxDistanceKm);
      return !(min >= 18 && max <= 100 && min <= max && dist > 0 && dist <= 500);
    }
    if (step === 3) return galleryUris.length < 1 || !collectionUri;
    if (step === 6) {
      return !displayLocation.trim() || latitude == null || longitude == null || !bio.trim();
    }
    return false;
  }, [
    step,
    displayName,
    dateOfBirth,
    gender,
    minAge,
    maxAge,
    maxDistanceKm,
    galleryUris,
    collectionUri,
    displayLocation,
    latitude,
    longitude,
    bio,
  ]);

  const pickImage = async (target: 'gallery' | 'collection') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    if (target === 'gallery') {
      setGalleryUris((prev) => (prev.length >= 6 ? prev : [...prev, uri]));
    } else {
      setCollectionUri(uri);
    }
  };

  const uploadUri = async (uri: string, path: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const { error: uploadError } = await supabase.storage.from('profile-photos').upload(path, blob, {
      upsert: true,
      contentType: blob.type || 'image/jpeg',
    });
    if (uploadError) throw uploadError;
    return path;
  };

  const useGps = async () => {
    setError(null);
    setLoading(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setError('Location permission denied — search for a place instead.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const { latitude: lat, longitude: lng } = position.coords;
      const place = await reverseGeocode(lat, lng);
      setDisplayLocation(place.displayLocation);
      setLatitude(place.latitude);
      setLongitude(place.longitude);
      setPlaceQuery('');
      setPlaceResults([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read location');
    } finally {
      setLoading(false);
    }
  };

  const persistStep = async () => {
    setError(null);
    setLoading(true);
    try {
      if (step === 1 && gender) {
        await saveOnboarding({
          action: 'save_identity',
          displayName: displayName.trim(),
          dateOfBirth,
          gender,
        });
      } else if (step === 2) {
        await saveOnboarding({
          action: 'save_preferences',
          interestedIn,
          minAge: Number(minAge),
          maxAge: Number(maxAge),
          maxDistanceKm: Number(maxDistanceKm),
        });
      } else if (step === 3) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Not signed in');
        const galleryPaths: string[] = [];
        for (let i = 0; i < galleryUris.length; i += 1) {
          const path = `${user.id}/gallery-${i}-${Date.now()}.jpg`;
          galleryPaths.push(await uploadUri(galleryUris[i]!, path));
        }
        const collectionPath = await uploadUri(
          collectionUri!,
          `${user.id}/collection-${Date.now()}.jpg`,
        );
        await saveOnboarding({
          action: 'save_photos',
          galleryPaths,
          collectionPath,
        });
      } else if (step === 4) {
        await saveOnboarding({
          action: 'save_themes',
          themes: themes.map((theme, index) => ({
            theme,
            rank: (index + 1) as 1 | 2 | 3,
          })),
        });
      } else if (step === 5) {
        const cleaned = topSets
          .map((set) => ({
            setNumber: set.setNumber.trim(),
            name: set.name.trim(),
          }))
          .filter((set) => set.setNumber && set.name)
          .slice(0, 3)
          .map((set, index) => ({
            ...set,
            rank: (index + 1) as 1 | 2 | 3,
          }));
        await saveOnboarding({ action: 'save_top_sets', topSets: cleaned });
      } else if (step === 6 && latitude != null && longitude != null) {
        await saveOnboarding({
          action: 'save_place_bio',
          displayLocation: displayLocation.trim(),
          latitude,
          longitude,
          bio: bio.trim(),
        });
        const complete = await saveOnboarding({ action: 'complete' });
        if (!complete.ok) {
          throw new Error(complete.reasons?.join(', ') ?? 'Could not complete Onboarding');
        }
        await refreshBootstrap();
        router.replace('/');
        return;
      }
      setStep((s) => Math.min(6, s + 1));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const skipOptional = async () => {
    if (step === 4) {
      setThemes([]);
      setLoading(true);
      try {
        await saveOnboarding({ action: 'save_themes', themes: [] });
        setStep(5);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not skip');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (step === 5) {
      setLoading(true);
      try {
        await saveOnboarding({ action: 'save_top_sets', topSets: [] });
        setStep(6);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not skip');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleTheme = (theme: LegoTheme) => {
    setThemes((prev) => {
      if (prev.includes(theme)) return prev.filter((t) => t !== theme);
      if (prev.length >= 3) return prev;
      return [...prev, theme];
    });
  };

  return (
    <OnboardingShell
      step={step}
      title={
        (
          {
            1: 'About you',
            2: 'Who you’re looking for',
            3: 'Add your photos',
            4: 'Favourite themes',
            5: 'Top sets',
            6: 'Place & bio',
          } as const
        )[step as 1 | 2 | 3 | 4 | 5 | 6]
      }
      subtitle={
        (
          {
            1: 'A few basics for your Profile.',
            2: 'Discovery filters — you can change these later.',
            3: 'At least one gallery photo and one collection photo.',
            4: 'Optional — pick up to three, or skip.',
            5: 'Optional — set number and name, or skip.',
            6: 'Where you are and a short intro.',
          } as const
        )[step as 1 | 2 | 3 | 4 | 5 | 6]
      }
      onBack={step > 1 ? () => setStep((s) => s - 1) : undefined}
      onSkip={step === 4 || step === 5 ? skipOptional : undefined}
      onNext={persistStep}
      nextLabel={step === 6 ? 'Finish' : 'Continue'}
      loading={loading}
      nextDisabled={nextDisabled}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {step === 1 ? (
          <View style={styles.block}>
            <TextField label="Display name" value={displayName} onChangeText={setDisplayName} />
            <TextField
              label="Date of birth (YYYY-MM-DD)"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="1995-06-15"
              autoCapitalize="none"
            />
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.chipRow}>
              {(['male', 'female'] as Gender[]).map((value) => (
                <Pressable
                  key={value}
                  onPress={() => setGender(value)}
                  style={[styles.chip, gender === value && styles.chipActive]}>
                  <Text style={[styles.chipText, gender === value && styles.chipTextActive]}>
                    {value === 'male' ? 'Male' : 'Female'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.block}>
            <Text style={styles.fieldLabel}>Interested in</Text>
            <View style={styles.chipRow}>
              {(['male', 'female', 'both'] as InterestedIn[]).map((value) => (
                <Pressable
                  key={value}
                  onPress={() => setInterestedIn(value)}
                  style={[styles.chip, interestedIn === value && styles.chipActive]}>
                  <Text
                    style={[styles.chipText, interestedIn === value && styles.chipTextActive]}>
                    {value === 'both' ? 'Everyone' : value === 'male' ? 'Men' : 'Women'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextField label="Min age" keyboardType="number-pad" value={minAge} onChangeText={setMinAge} />
            <TextField label="Max age" keyboardType="number-pad" value={maxAge} onChangeText={setMaxAge} />
            <TextField
              label="Max distance (km)"
              keyboardType="number-pad"
              value={maxDistanceKm}
              onChangeText={setMaxDistanceKm}
            />
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.block}>
            <Text style={styles.fieldLabel}>Gallery photos</Text>
            <View style={styles.photoRow}>
              {galleryUris.map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.thumb} />
              ))}
              {galleryUris.length < 6 ? (
                <Pressable style={styles.addPhoto} onPress={() => pickImage('gallery')}>
                  <Text style={styles.addPhotoText}>+</Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.fieldLabel}>Collection photo</Text>
            {collectionUri ? (
              <Image source={{ uri: collectionUri }} style={styles.collection} />
            ) : (
              <Pressable style={styles.addCollection} onPress={() => pickImage('collection')}>
                <Text style={styles.addPhotoText}>Add collection photo</Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {step === 4 ? (
          <View style={styles.chipWrap}>
            {THEME_OPTIONS.map((option) => {
              const active = themes.includes(option.value);
              return (
                <Pressable
                  key={option.value}
                  onPress={() => toggleTheme(option.value)}
                  style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {step === 5 ? (
          <View style={styles.block}>
            {topSets.map((set, index) => (
              <View key={index} style={styles.setBlock}>
                <Text style={styles.fieldLabel}>Set {index + 1}</Text>
                <TextField
                  label="Set number"
                  value={set.setNumber}
                  onChangeText={(text) =>
                    setTopSets((prev) =>
                      prev.map((row, i) => (i === index ? { ...row, setNumber: text } : row)),
                    )
                  }
                />
                <TextField
                  label="Name"
                  value={set.name}
                  onChangeText={(text) =>
                    setTopSets((prev) =>
                      prev.map((row, i) => (i === index ? { ...row, name: text } : row)),
                    )
                  }
                />
              </View>
            ))}
            {topSets.length < 3 ? (
              <Pressable
                onPress={() => setTopSets((prev) => [...prev, { setNumber: '', name: '' }])}>
                <Text style={styles.link}>Add another set</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {step === 6 ? (
          <View style={styles.block}>
            <Pressable style={styles.gpsButton} onPress={useGps}>
              <Text style={styles.gpsText}>Use my current location</Text>
            </Pressable>
            {displayLocation ? (
              <Text style={styles.selectedPlace}>{displayLocation}</Text>
            ) : null}
            <TextField
              label="Or search for a place"
              value={placeQuery}
              onChangeText={setPlaceQuery}
              autoCapitalize="words"
            />
            {placeLoading ? <ActivityIndicator color={Brand.brick} /> : null}
            <FlatList
              data={visiblePlaceResults}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.placeRow}
                  onPress={() => {
                    setDisplayLocation(item.displayLocation);
                    setLatitude(item.latitude);
                    setLongitude(item.longitude);
                    setPlaceQuery('');
                    setPlaceResults([]);
                  }}>
                  <Text style={styles.placeText}>{item.displayLocation}</Text>
                </Pressable>
              )}
            />
            <TextField
              label="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
              style={styles.bio}
              placeholder="What are you building lately?"
            />
          </View>
        ) : null}
      </ScrollView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  block: {
    gap: Spacing.three,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.ink,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    backgroundColor: Brand.white,
    borderWidth: 1.5,
    borderColor: '#D5CFC6',
  },
  chipActive: {
    backgroundColor: Brand.brick,
    borderColor: Brand.brick,
  },
  chipText: {
    color: Brand.ink,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Brand.white,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  thumb: {
    width: 88,
    height: 88,
    borderRadius: 12,
  },
  addPhoto: {
    width: 88,
    height: 88,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Brand.inkMuted,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    color: Brand.inkMuted,
    fontSize: 28,
    fontWeight: '500',
  },
  collection: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  addCollection: {
    height: 120,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Brand.inkMuted,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setBlock: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  link: {
    color: Brand.brickDeep,
    fontWeight: '700',
  },
  gpsButton: {
    backgroundColor: Brand.stud,
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  gpsText: {
    color: Brand.white,
    fontWeight: '700',
    fontSize: 16,
  },
  selectedPlace: {
    color: Brand.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  placeRow: {
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.paperDeep,
  },
  placeText: {
    color: Brand.ink,
    fontSize: 15,
  },
  bio: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: Spacing.three,
  },
  error: {
    color: Brand.danger,
    fontSize: 14,
  },
});
