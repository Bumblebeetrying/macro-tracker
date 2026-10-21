import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Search,
  RotateCcw,
  Activity,
  Pencil,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  PlusCircle
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const PremiumIcons = {
  Logo: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  Biometrics: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Food: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
      <path d="M7 2v20"></path>
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
    </svg>
  ),
  Progress: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
    </svg>
  ),
  Split: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Beef: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M18 6h-2c-1.1 0-2 .9-2 2v2h6V8c0-1.1-.9-2-2-2z"></path>
      <path d="M20 10H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z"></path>
    </svg>
  ),
  Wheat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M2 22 16 8"></path>
      <path d="M3.47 12.53 5 11l1.5 1.5L5 14l-1.53-1.47Z"></path>
      <path d="M8 9.5 9.5 8 11 9.5 9.5 11 8 9.5Z"></path>
      <path d="M12.5 6.5 14 5l1.5 1.5L14 8l-1.5-1.5Z"></path>
      <path d="M17 3.5 18.5 2 20 3.5 18.5 5 17 3.5Z"></path>
    </svg>
  ),
  Droplet: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
    </svg>
  )
};

const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentary', desc: 'Little to no exercise; mostly sitting throughout the day.' },
  { value: 1.375, label: 'Lightly Active', desc: 'Light exercise or physical activity 1–3 days per week.' },
  { value: 1.55, label: 'Moderately Active', desc: 'Moderate exercise or workouts 3–5 days per week.' },
  { value: 1.725, label: 'Very Active', desc: 'Intense exercise or workouts 6–7 days per week.' },
  { value: 1.9, label: 'Athlete', desc: 'Extremely intense training, multiple daily workouts, or a physically demanding job.' }
];

const INITIAL_FOOD_DB = [
  { id: 'f1', name: 'Chicken Breast (Cooked)', serving: '100g', calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'Protein', emoji: '🍗' },
  { id: 'f2', name: 'Whole Egg (Large)', serving: '1 large (50g)', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, category: 'Protein', emoji: '🥚' },
  { id: 'f3', name: 'Egg Whites', serving: '100g (approx 3)', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, category: 'Protein', emoji: '🍳' },
  { id: 'f4', name: 'Atlantic Salmon (Cooked)', serving: '100g', calories: 206, protein: 22, carbs: 0, fat: 12, category: 'Protein', emoji: '🐟' },
  { id: 'f5', name: 'Whey Protein Isolate', serving: '1 scoop (30g)', calories: 120, protein: 25, carbs: 2, fat: 1, category: 'Supplement', emoji: '🥤' },
  { id: 'f6', name: 'Greek Yogurt (Non-Fat)', serving: '150g', calories: 89, protein: 15, carbs: 5.4, fat: 0.6, category: 'Dairy', emoji: '🥣' },
  { id: 'f7', name: 'Tofu (Firm)', serving: '100g', calories: 144, protein: 17, carbs: 3, fat: 9, category: 'Protein', emoji: '🧊' },
  { id: 'f8', name: 'Canned Tuna (in Water)', serving: '1 can (120g)', calories: 130, protein: 29, carbs: 0, fat: 1, category: 'Protein', emoji: '🥫' },
  { id: 'f9', name: 'Paneer (Indian Cottage Cheese)', serving: '100g', calories: 265, protein: 18.3, carbs: 3.4, fat: 20.8, category: 'Indian', emoji: '🧀' },
  { id: 'f10', name: 'Yellow Dal Tadka (Cooked)', serving: '1 bowl (150g)', calories: 180, protein: 9.5, carbs: 24, fat: 5, category: 'Indian', emoji: '🍲' },
  { id: 'f11', name: 'Whole Wheat Roti / Chapati', serving: '1 medium (40g)', calories: 120, protein: 3.5, carbs: 22, fat: 2, category: 'Indian', emoji: '🫓' },
  { id: 'f12', name: 'Rajma / Chickpea Curry', serving: '1 bowl (150g)', calories: 210, protein: 10, carbs: 30, fat: 5.5, category: 'Indian', emoji: '🍛' },
  { id: 'f13', name: 'Moong Dal Chilla', serving: '1 piece (60g)', calories: 135, protein: 7.5, carbs: 18, fat: 3.5, category: 'Indian', emoji: '🥞' },
  { id: 'f14', name: 'Soya Chunks (Uncooked wt)', serving: '50g', calories: 172, protein: 26, carbs: 16.5, fat: 0.5, category: 'Indian', emoji: '🧆' },
  { id: 'f15', name: 'Rolled Oats (Uncooked)', serving: '50g', calories: 194, protein: 6.5, carbs: 34, fat: 3.3, category: 'Carbs', emoji: '🌾' },
  { id: 'f16', name: 'White Basmati Rice (Cooked)', serving: '150g', calories: 195, protein: 4.1, carbs: 42, fat: 0.4, category: 'Carbs', emoji: '🍚' },
  { id: 'f17', name: 'Brown Rice (Cooked)', serving: '150g', calories: 168, protein: 3.9, carbs: 35, fat: 1.5, category: 'Carbs', emoji: '🍘' },
  { id: 'f18', name: 'Sweet Potato (Boiled)', serving: '150g', calories: 129, protein: 2.1, carbs: 30, fat: 0.2, category: 'Carbs', emoji: '🍠' },
  { id: 'f19', name: 'Quinoa (Cooked)', serving: '150g', calories: 180, protein: 6.6, carbs: 32, fat: 2.8, category: 'Carbs', emoji: '🥣' },
  { id: 'f20', name: 'Sourdough Bread', serving: '1 slice (45g)', calories: 120, protein: 4.5, carbs: 24, fat: 0.8, category: 'Carbs', emoji: '🍞' },
  { id: 'f21', name: 'Banana (Medium)', serving: '1 medium (118g)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, category: 'Fruit', emoji: '🍌' },
  { id: 'f22', name: 'Apple (Medium)', serving: '1 medium (180g)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, category: 'Fruit', emoji: '🍎' },
  { id: 'f23', name: 'Blueberries', serving: '100g', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, category: 'Fruit', emoji: '🫐' },
  { id: 'f24', name: 'Broccoli (Steamed)', serving: '100g', calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, category: 'Veggies', emoji: '🥦' },
  { id: 'f25', name: 'Spinach & Mixed Greens', serving: '100g', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: 'Veggies', emoji: '🥬' },
  { id: 'f26', name: 'Avocado', serving: '1/2 medium (100g)', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, category: 'Fats', emoji: '🥑' },
  { id: 'f27', name: 'Almonds (Raw)', serving: '28g (approx 23)', calories: 164, protein: 6, carbs: 6, fat: 14, category: 'Fats', emoji: '🥜' },
  { id: 'f28', name: 'Peanut Butter (Natural)', serving: '1 tbsp (16g)', calories: 94, protein: 4, carbs: 3.2, fat: 8, category: 'Fats', emoji: '🥄' },
  { id: 'f29', name: 'Extra Virgin Olive Oil', serving: '1 tbsp (14g)', calories: 119, protein: 0, carbs: 0, fat: 13.5, category: 'Fats', emoji: '🫒' },
  { id: 'f30', name: 'Chia Seeds', serving: '1 tbsp (12g)', calories: 58, protein: 2, carbs: 5, fat: 3.7, category: 'Fats', emoji: '🌱' }
];

const MEAL_SECTIONS = [
  { id: 'breakfast', title: 'Breakfast', icon: '🌅', timeHint: '7:00 AM – 9:30 AM' },
  { id: 'lunch', title: 'Lunch', icon: '☀️', timeHint: '12:30 PM – 2:30 PM' },
  { id: 'snacks', title: 'Snacks', icon: '⚡', timeHint: '4:30 PM – 6:00 PM' },
  { id: 'dinner', title: 'Dinner', icon: '🌙', timeHint: '7:30 PM – 9:30 PM' }
];

const AVATARS = {
  a1: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  a2: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="3" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21" />
      <line x1="3" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21" y2="12" />
    </svg>
  ),
  a3: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  a4: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
      <polygon points="12 2 19 21 12 17 5 21 12 2" />
    </svg>
  )
};

const INITIAL_PROFILES = [
  {
    id: 'p1',
    name: 'Profile 1',
    accent: '#E8A5B8',
    avatarId: 'a1',
    biometrics: {
      gender: 'male',
      age: '19',
      weight: '74',
      height: '176',
      activity: 1.55,
      goalOffset: -400,
      proteinRatio: 2.0
    },
    mealsByDate: {},
    customFoods: []
  },
  {
    id: 'p2',
    name: 'Profile 2',
    accent: '#F59E0B',
    avatarId: 'a2',
    biometrics: {
      gender: 'female',
      age: '21',
      weight: '58',
      height: '165',
      activity: 1.375,
      goalOffset: -250,
      proteinRatio: 1.8
    },
    mealsByDate: {},
    customFoods: []
  },
  {
    id: 'p3',
    name: 'Profile 3',
    accent: '#38BDF8',
    avatarId: 'a3',
    biometrics: {
      gender: 'male',
      age: '24',
      weight: '82',
      height: '182',
      activity: 1.725,
      goalOffset: 300,
      proteinRatio: 2.2
    },
    mealsByDate: {},
    customFoods: []
  },
  {
    id: 'p4',
    name: 'Profile 4',
    accent: '#A78BFA',
    avatarId: 'a4',
    biometrics: {
      gender: 'female',
      age: '22',
      weight: '64',
      height: '170',
      activity: 1.55,
      goalOffset: 0,
      proteinRatio: 2.0
    },
    mealsByDate: {},
    customFoods: []
  }
];

const EMPTY_MEAL_SLOTS = { breakfast: [], lunch: [], snacks: [], dinner: [] };

const formatDateKey = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export default function App() {
  const [profilesData, setProfilesData] = useState(INITIAL_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [isManageMode, setIsManageMode] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [editingNameValue, setEditingNameValue] = useState('');

  const [user, setUser] = useState(null);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const localDataRef = useRef(JSON.stringify(INITIAL_PROFILES));

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localDataRef.current = JSON.stringify(profilesData);
  }, [profilesData]);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'macroData', 'profiles');
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data().profilesData;
        if (JSON.stringify(remoteData) !== localDataRef.current) {
          setProfilesData(remoteData);
        }
      }
      setIsDbLoaded(true);
    }, (error) => console.error("Firestore error:", error));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!isDbLoaded || !user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'macroData', 'profiles');
    setDoc(docRef, { profilesData });
  }, [profilesData, isDbLoaded, user]);

  const todayObj = useMemo(() => new Date(), []);
  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    formatDateKey(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate())
  );

  const currentProfileObj = useMemo(
    () => profilesData.find((p) => p.id === activeProfileId) || profilesData[0],
    [profilesData, activeProfileId]
  );

  const profile = currentProfileObj.biometrics;
  const meals = useMemo(() => {
    const byDate = currentProfileObj.mealsByDate || {};
    return byDate[selectedDateKey] || EMPTY_MEAL_SLOTS;
  }, [currentProfileObj.mealsByDate, selectedDateKey]);

  const foodDb = useMemo(
    () => [...currentProfileObj.customFoods, ...INITIAL_FOOD_DB],
    [currentProfileObj.customFoods]
  );

  const setProfile = (updater) => {
    setProfilesData((prev) =>
      prev.map((p) => {
        if (p.id !== activeProfileId) return p;
        const nextBio = typeof updater === 'function' ? updater(p.biometrics) : updater;
        return { ...p, biometrics: nextBio };
      })
    );
  };

  const setMeals = (updater) => {
    setProfilesData((prev) =>
      prev.map((p) => {
        if (p.id !== activeProfileId) return p;
        const byDate = p.mealsByDate || {};
        const currentDayMeals = byDate[selectedDateKey] || EMPTY_MEAL_SLOTS;
        const nextDayMeals = typeof updater === 'function' ? updater(currentDayMeals) : updater;
        return {
          ...p,
          mealsByDate: {
            ...byDate,
            [selectedDateKey]: nextDayMeals
          }
        };
      })
    );
  };

  const handleRenameProfile = (id, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setProfilesData((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: trimmed } : p))
    );
    setEditingProfileId(null);
  };

  const [activeMealToAdd, setActiveMealToAdd] = useState('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [quickAddServings, setQuickAddServings] = useState({});

  const [customFood, setCustomFood] = useState({
    name: '',
    serving: '100g',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    category: 'Custom',
    emoji: '🍽️',
    targetMeal: 'breakfast',
    initialServings: 1
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const targets = useMemo(() => {
    const w = Number(profile.weight) > 0 ? Number(profile.weight) : 70;
    const h = Number(profile.height) > 0 ? Number(profile.height) : 170;
    const a = Number(profile.age) > 0 ? Number(profile.age) : 19;

    let bmr = 10 * w + 6.25 * h - 5 * a;
    bmr += profile.gender === 'male' ? 5 : -161;

    const tdee = Math.round(bmr * profile.activity);
    const calories = Math.max(1200, tdee + profile.goalOffset);

    const proteinGrams = Math.round(w * profile.proteinRatio);
    const proteinCals = proteinGrams * 4;

    const remainingCals = Math.max(200, calories - proteinCals);
    const carbsGrams = Math.round((remainingCals * 0.55) / 4);
    const fatGrams = Math.round((remainingCals * 0.45) / 9);

    return {
      bmr: Math.round(bmr),
      tdee,
      calories,
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams
    };
  }, [profile]);

  const consumed = useMemo(() => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    const byMeal = {};

    MEAL_SECTIONS.forEach((section) => {
      const items = meals[section.id] || [];
      let mCal = 0, mPro = 0, mCarb = 0, mFat = 0;

      items.forEach((entry) => {
        const food = foodDb.find((f) => f.id === entry.foodId);
        if (food) {
          const mult = Number(entry.servings) || 0;
          mCal += food.calories * mult;
          mPro += food.protein * mult;
          mCarb += food.carbs * mult;
          mFat += food.fat * mult;
        }
      });

      byMeal[section.id] = {
        calories: Math.round(mCal),
        protein: Math.round(mPro * 10) / 10,
        carbs: Math.round(mCarb * 10) / 10,
        fat: Math.round(mFat * 10) / 10
      };

      totalCalories += mCal;
      totalProtein += mPro;
      totalCarbs += mCarb;
      totalFat += mFat;
    });

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      byMeal
    };
  }, [meals, foodDb]);

  const macroCalorieSplit = useMemo(() => {
    const pCal = consumed.protein * 4;
    const cCal = consumed.carbs * 4;
    const fCal = consumed.fat * 9;
    const sum = pCal + cCal + fCal;
    if (sum === 0) return { pPct: 0, cPct: 0, fPct: 0, pCal: 0, cCal: 0, fCal: 0 };
    return {
      pPct: Math.round((pCal / sum) * 100),
      cPct: Math.round((cCal / sum) * 100),
      fPct: Math.max(0, 100 - Math.round((pCal / sum) * 100) - Math.round((cCal / sum) * 100)),
      pCal: Math.round(pCal),
      cCal: Math.round(cCal),
      fCal: Math.round(fCal)
    };
  }, [consumed]);

  const calendarDaysData = useMemo(() => {
    const y = todayObj.getFullYear();
    const startDate = new Date(y, 0, 1);
    const endDate = new Date(y, 11, 31);
    const firstDayIndex = startDate.getDay();
    const byDate = currentProfileObj.mealsByDate || {};

    const getDayCalories = (dayMeals) => {
      if (!dayMeals) return 0;
      let total = 0;
      MEAL_SECTIONS.forEach((sec) => {
        const list = dayMeals[sec.id] || [];
        list.forEach((entry) => {
          const food = foodDb.find((f) => f.id === entry.foodId);
          if (food) {
            total += food.calories * (Number(entry.servings) || 0);
          }
        });
      });
      return Math.round(total);
    };

    const days = [];
    let dayIndexCounter = firstDayIndex;
    let completeCount = 0;
    let halfCount = 0;

    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const curY = cursor.getFullYear();
      const m = cursor.getMonth();
      const d = cursor.getDate();

      const dateKey = formatDateKey(curY, m, d);
      const dayCalories = getDayCalories(byDate[dateKey]);
      const ratio = targets.calories > 0 ? dayCalories / targets.calories : 0;

      let status = 'less-than-half';
      if (ratio >= 1) {
        status = 'complete';
        completeCount++;
      } else if (ratio >= 0.5) {
        status = 'more-than-half';
        halfCount++;
      }

      days.push({
        day: d,
        dateKey,
        calories: dayCalories,
        ratio,
        status
      });

      dayIndexCounter++;
      cursor.setDate(cursor.getDate() + 1);
    }

    const totalCols = Math.ceil(dayIndexCounter / 7);
    const trailingPad = totalCols * 7 - dayIndexCounter;

    return {
      firstDayIndex,
      trailingPad,
      days,
      totalCols,
      completeCount,
      halfCount,
      yearLabel: String(y)
    };
  }, [todayObj, currentProfileObj.mealsByDate, foodDb, targets.calories]);

  const handleAddFoodToMeal = (foodId, mealId = activeMealToAdd, customServings = null) => {
    const servingsToAdd = customServings !== null ? Number(customServings) : Number(quickAddServings[foodId] || 1);
    if (servingsToAdd <= 0) return;

    const food = foodDb.find((f) => f.id === foodId);
    setMeals((prev) => {
      const existingList = prev[mealId] || [];
      const existingIndex = existingList.findIndex((item) => item.foodId === foodId);

      if (existingIndex > -1) {
        const updated = [...existingList];
        updated[existingIndex] = {
          ...updated[existingIndex],
          servings: Math.round((updated[existingIndex].servings + servingsToAdd) * 100) / 100
        };
        return { ...prev, [mealId]: updated };
      } else {
        return {
          ...prev,
          [mealId]: [
            ...existingList,
            {
              uid: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              foodId,
              servings: servingsToAdd
            }
          ]
        };
      }
    });

    if (food) {
      const mealTitle = MEAL_SECTIONS.find((m) => m.id === mealId)?.title || mealId;
      triggerToast(`Added ${servingsToAdd}x ${food.name} to ${mealTitle}`);
    }
  };

  const handleUpdateServings = (mealId, uid, newServings) => {
    const parsed = parseFloat(newServings);
    if (isNaN(parsed) || parsed < 0) return;
    setMeals((prev) => ({
      ...prev,
      [mealId]: prev[mealId].map((item) => (item.uid === uid ? { ...item, servings: parsed } : item))
    }));
  };

  const handleStepServings = (mealId, uid, delta) => {
    setMeals((prev) => ({
      ...prev,
      [mealId]: prev[mealId]
        .map((item) => {
          if (item.uid !== uid) return item;
          const nextVal = Math.round((item.servings + delta) * 100) / 100;
          return nextVal <= 0 ? null : { ...item, servings: nextVal };
        })
        .filter(Boolean)
    }));
  };

  const handleRemoveMealItem = (mealId, uid) => {
    setMeals((prev) => ({
      ...prev,
      [mealId]: prev[mealId].filter((item) => item.uid !== uid)
    }));
  };

  const handleCreateCustomFood = (e) => {
    e.preventDefault();
    if (!customFood.name.trim()) return;

    const protein = Math.max(0, parseFloat(customFood.protein) || 0);
    const carbs = Math.max(0, parseFloat(customFood.carbs) || 0);
    const fat = Math.max(0, parseFloat(customFood.fat) || 0);
    const autoCal = Math.round(protein * 4 + carbs * 4 + fat * 9);
    const calories = customFood.calories !== '' ? Math.max(0, parseFloat(customFood.calories)) : autoCal;

    const newFoodItem = {
      id: `custom_${Date.now()}`,
      name: customFood.name.trim(),
      serving: customFood.serving.trim() || '1 serving',
      calories: Math.round(calories),
      protein,
      carbs,
      fat,
      category: 'Custom',
      emoji: customFood.emoji || '🍽️'
    };

    setProfilesData((prev) =>
      prev.map((p) =>
        p.id === activeProfileId
          ? { ...p, customFoods: [newFoodItem, ...p.customFoods] }
          : p
      )
    );
    handleAddFoodToMeal(newFoodItem.id, customFood.targetMeal, parseFloat(customFood.initialServings) || 1);
    setShowCustomFoodModal(false);
    triggerToast(`Created & logged ${newFoodItem.name}!`);
  };

  const categories = ['All', 'Protein', 'Indian', 'Carbs', 'Fats', 'Dairy', 'Fruit', 'Veggies', 'Custom'];
  const filteredFoods = useMemo(() => {
    return foodDb.filter((f) => {
      const matchesCat = selectedCategory === 'All' || f.category === selectedCategory;
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [foodDb, selectedCategory, searchQuery]);

  if (!isDbLoaded) {
    return (
      <div className="min-h-screen bg-[#2E1019] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#4A1826] border-t-[#E8A5B8] animate-spin shadow-[0_0_15px_#E8A5B8]" />
      </div>
    );
  }

  if (!activeProfileId) {
    return (
      <div className="min-h-screen bg-[#2E1019] text-[#F3E8EC] premium-font antialiased flex flex-col justify-between p-6 sm:p-12 selection:bg-[#5C1D2F] selection:text-white">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
          .premium-font {
            font-family: 'Outfit', system-ui, -apple-system, sans-serif;
          }
          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}</style>

        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3D1421] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-2px_-2px_5px_rgba(92,29,47,0.4)] flex items-center justify-center text-[#E8A5B8]">
              <PremiumIcons.Logo />
            </div>
            <span className="text-xl font-black tracking-widest uppercase text-[#F3E8EC]">
              macro
            </span>
          </div>
        </div>

        <div className="my-auto max-w-4xl w-full mx-auto text-center space-y-10 py-10">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide text-[#F3E8EC]">
              {isManageMode ? 'Manage Profiles' : "Who's tracking?"}
            </h1>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-3xl mx-auto px-2">
            {profilesData.map((prof) => {
              const isEditingThis = editingProfileId === prof.id;
              const loggedItemsCount = Object.values(prof.mealsByDate || {}).reduce(
                (totalAcc, dayMeals) =>
                  totalAcc +
                  Object.values(dayMeals || {}).reduce((acc, list) => acc + list.length, 0),
                0
              );

              return (
                <div key={prof.id} className="group flex flex-col items-center space-y-4">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        if (isManageMode) {
                          setEditingProfileId(prof.id);
                          setEditingNameValue(prof.name);
                        } else {
                          setActiveProfileId(prof.id);
                        }
                      }}
                      className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-[#2E1019] shadow-[8px_8px_20px_rgba(18,6,10,0.75),-8px_-8px_20px_rgba(74,24,38,0.6)] hover:shadow-[inset_4px_4px_10px_rgba(18,6,10,0.8),inset_-4px_-4px_10px_rgba(74,24,38,0.5)] border border-[#4A1826]/60 group-hover:border-[#E8A5B8]/70 transition-all duration-300 flex flex-col items-center justify-center gap-2 relative overflow-hidden group-hover:-translate-y-1"
                    >
                      <div
                        className="p-4 rounded-2xl bg-[#250C13] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-110"
                        style={{ color: prof.accent }}
                      >
                        {AVATARS[prof.avatarId]}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-[#D1A3B3]/70">
                        <span>{prof.biometrics.weight}kg</span>
                        <span>•</span>
                        <span>{prof.biometrics.height}cm</span>
                      </div>

                      {loggedItemsCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#E8A5B8] shadow-[0_0_8px_#E8A5B8]" />
                      )}

                      {isManageMode && (
                        <div className="absolute inset-0 bg-[#12060A]/65 backdrop-blur-[2px] flex items-center justify-center">
                          <div className="p-3 rounded-2xl bg-[#3D1421] text-[#E8A5B8] shadow-[4px_4px_10px_rgba(0,0,0,0.6)]">
                            <Pencil className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    </button>

                    {!isManageMode && !isEditingThis && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProfileId(prof.id);
                          setEditingNameValue(prof.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#3D1421] text-[#E8A5B8] hover:bg-[#4A1826] shadow-[3px_3px_8px_rgba(18,6,10,0.7)] transition"
                        title="Rename Profile"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {isEditingThis ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleRenameProfile(prof.id, editingNameValue);
                      }}
                      className="flex items-center gap-1.5 w-full max-w-[150px]"
                    >
                      <input
                        type="text"
                        autoFocus
                        maxLength={18}
                        value={editingNameValue}
                        onChange={(e) => setEditingNameValue(e.target.value)}
                        onBlur={() => handleRenameProfile(prof.id, editingNameValue)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#250C13] text-xs font-bold text-[#F3E8EC] text-center shadow-[inset_2px_2px_5px_rgba(0,0,0,0.7)] focus:outline-none border border-[#E8A5B8]/50"
                      />
                    </form>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span
                        onClick={() => {
                          if (isManageMode) {
                            setEditingProfileId(prof.id);
                            setEditingNameValue(prof.name);
                          } else {
                            setActiveProfileId(prof.id);
                          }
                        }}
                        className="text-sm sm:text-base font-medium text-[#D1A3B3] group-hover:text-[#F3E8EC] cursor-pointer transition truncate max-w-[140px]"
                      >
                        {prof.name}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => {
                setIsManageMode(!isManageMode);
                setEditingProfileId(null);
              }}
              className={`px-7 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition ${
                isManageMode
                  ? 'bg-[#E8A5B8] text-[#2E1019] shadow-[4px_4px_12px_rgba(18,6,10,0.7)]'
                  : 'bg-[#2E1019] text-[#D1A3B3] hover:text-[#F3E8EC] shadow-[6px_6px_14px_rgba(18,6,10,0.7),-6px_-6px_14px_rgba(74,24,38,0.5)] border border-[#4A1826]/60'
              }`}
            >
              {isManageMode ? 'Done' : 'Manage Profiles'}
            </button>
          </div>
        </div>

        <div className="max-w-6xl w-full mx-auto text-center text-[11px] font-medium tracking-widest uppercase text-[#D1A3B3]/40">
          Isolated Biometrics & Logs Per Profile
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2E1019] text-[#F3E8EC] premium-font antialiased pb-20 selection:bg-[#5C1D2F] selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        
        .premium-font {
          font-family: 'Outfit', system-ui, -apple-system, sans-serif;
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#4A1826] text-[#F3E8EC] px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#7A2B41] animate-bounce">
          <Check className="w-4 h-4 text-[#E8A5B8] shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#2E1019]/90 border-b border-[#4A1826]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3D1421] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-2px_-2px_5px_rgba(92,29,47,0.4)] flex items-center justify-center text-[#E8A5B8]">
              <PremiumIcons.Logo />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-widest text-[#F3E8EC] uppercase">
                  macro
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#3D1421] text-[#E8A5B8] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)]">
                  {currentProfileObj.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveProfileId(null)}
              className="flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-2xl bg-[#250C13] hover:bg-[#3D1421] text-[#E8A5B8] shadow-[4px_4px_10px_rgba(18,6,10,0.6),-4px_-4px_10px_rgba(74,24,38,0.5)] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)] transition"
              title="Switch Profile"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Switch Profile</span>
            </button>

            <button
              onClick={() =>
                setMeals({
                  breakfast: [],
                  lunch: [],
                  snacks: [],
                  dinner: []
                })
              }
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-2xl bg-[#3D1421] hover:bg-[#4A1826] text-[#D1A3B3] shadow-[4px_4px_10px_rgba(18,6,10,0.6),-4px_-4px_10px_rgba(74,24,38,0.5)] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)] transition"
              title="Clear meals for this profile"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Log</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* ========================================== */}
        {/* SECTION 1: BIOMETRICS & ENGINE             */}
        {/* ========================================== */}
        <section className="bg-[#2E1019] rounded-3xl p-5 sm:p-7 shadow-[8px_8px_20px_rgba(18,6,10,0.7),-8px_-8px_20px_rgba(74,24,38,0.6)] border border-[#4A1826]/50">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#3D1421] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4)] text-[#E8A5B8]">
                <PremiumIcons.Biometrics />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-medium tracking-wide text-[#F3E8EC]">
                  <span className="text-[#D1A3B3]/40 font-light mr-1.5">01 /</span>
                  Live Biometric & Calorie Engine
                </h2>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-[#250C13] px-3.5 py-2 rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)]">
              <span className="text-xs text-[#D1A3B3]">BMR:</span>
              <span className="text-xs font-bold text-[#F3E8EC]">{targets.bmr} kcal</span>
              <span className="text-[#5C1D2F] mx-1">|</span>
              <span className="text-xs text-[#D1A3B3]">TDEE:</span>
              <span className="text-xs font-bold text-[#F3E8EC]">{targets.tdee} kcal</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#D1A3B3] mb-1.5">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 bg-[#250C13] p-1 rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)]">
                    {['male', 'female'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setProfile({ ...profile, gender: g })}
                        className={`py-1.5 text-xs font-bold rounded-xl capitalize transition ${
                          profile.gender === g
                            ? 'bg-[#3D1421] text-[#E8A5B8] shadow-[2px_2px_5px_rgba(18,6,10,0.5)]'
                            : 'text-[#D1A3B3]/60 hover:text-[#F3E8EC]'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#D1A3B3] mb-1.5">
                    Age (yrs)
                  </label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-[#250C13] border-none text-sm font-bold text-[#F7E1E7] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.6),inset_-3px_-3px_6px_rgba(74,24,38,0.4)] focus:outline-none text-center"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#D1A3B3] mb-1.5">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-[#250C13] border-none text-sm font-bold text-[#F7E1E7] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.6),inset_-3px_-3px_6px_rgba(74,24,38,0.4)] focus:outline-none text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#D1A3B3] mb-1.5">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-[#250C13] border-none text-sm font-bold text-[#F7E1E7] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.6),inset_-3px_-3px_6px_rgba(74,24,38,0.4)] focus:outline-none text-center"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#D1A3B3] mb-1.5">
                    Physique Goal Offset
                  </label>
                  <div className="flex items-center gap-2 bg-[#250C13] px-3 py-1.5 rounded-2xl shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5)]">
                    <input
                      type="range"
                      min="-500"
                      max="500"
                      step="50"
                      value={profile.goalOffset}
                      onChange={(e) => setProfile({ ...profile, goalOffset: parseInt(e.target.value) })}
                      className="w-full accent-[#E8A5B8] cursor-pointer h-2 bg-[#2E1019] rounded-lg"
                    />
                    <span className="text-xs font-bold text-[#E8A5B8] shrink-0 w-16 text-right">
                      {profile.goalOffset > 0 ? `+${profile.goalOffset}` : profile.goalOffset}
                    </span>
                  </div>
                </div>
              </div>

              {}
              <div className="space-y-2 pt-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#D1A3B3]">
                  Activity Level
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {ACTIVITY_LEVELS.map((lvl) => {
                    const isSelected = profile.activity === lvl.value;
                    return (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => setProfile({ ...profile, activity: lvl.value })}
                        className={`w-full text-left p-2.5 rounded-2xl transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#3D1421] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] border border-[#E8A5B8]/50 text-[#F3E8EC]'
                            : 'bg-[#250C13] shadow-[4px_4px_10px_rgba(18,6,10,0.5)] text-[#D1A3B3]/80 hover:text-[#F3E8EC]'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{lvl.label}</div>
                          <div className="text-[10px] text-[#D1A3B3]/60 leading-tight mt-0.5">{lvl.desc}</div>
                        </div>
                        <span className={`text-xs font-extrabold px-2 py-1 rounded-xl shrink-0 ${isSelected ? 'bg-[#2E1019] text-[#E8A5B8]' : 'bg-[#2E1019]/60 text-[#D1A3B3]/60'}`}>
                          {lvl.value}x
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#250C13] p-3.5 rounded-2xl shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-[#D1A3B3]">Protein Multiplier</span>
                  <span className="font-extrabold text-[#E8A5B8]">{profile.proteinRatio}g / kg ({Math.round(profile.weight * profile.proteinRatio)}g total)</span>
                </div>
                <input
                  type="range"
                  min="1.2"
                  max="3.0"
                  step="0.1"
                  value={profile.proteinRatio}
                  onChange={(e) => setProfile({ ...profile, proteinRatio: parseFloat(e.target.value) })}
                  className="w-full accent-[#E8A5B8] cursor-pointer h-2 bg-[#2E1019] rounded-lg"
                />
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#250C13] rounded-2xl p-6 shadow-[inset_4px_4px_10px_rgba(18,6,10,0.8),inset_-4px_-4px_10px_rgba(74,24,38,0.5)] flex flex-col justify-between space-y-5">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#D1A3B3]/70">
                  Calculated Target
                </span>
                <div className="text-4xl sm:text-5xl font-black text-[#F3E8EC] tracking-tight">
                  {targets.calories} <span className="text-lg font-medium text-[#E8A5B8]">kcal</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-[#2E1019] p-3 rounded-2xl shadow-[4px_4px_10px_rgba(18,6,10,0.6),-4px_-4px_10px_rgba(74,24,38,0.4)] text-center">
                  <span className="block text-[10px] font-bold uppercase text-[#E8A5B8]">Protein</span>
                  <span className="text-lg font-black text-[#F3E8EC]">{targets.protein}g</span>
                  <span className="block text-[9px] text-[#D1A3B3]/60">{Math.round(targets.protein * 4)} kcal</span>
                </div>
                <div className="bg-[#2E1019] p-3 rounded-2xl shadow-[4px_4px_10px_rgba(18,6,10,0.6),-4px_-4px_10px_rgba(74,24,38,0.4)] text-center">
                  <span className="block text-[10px] font-bold uppercase text-[#D1A3B3]">Carbs</span>
                  <span className="text-lg font-black text-[#F3E8EC]">{targets.carbs}g</span>
                  <span className="block text-[9px] text-[#D1A3B3]/60">{Math.round(targets.carbs * 4)} kcal</span>
                </div>
                <div className="bg-[#2E1019] p-3 rounded-2xl shadow-[4px_4px_10px_rgba(18,6,10,0.6),-4px_-4px_10px_rgba(74,24,38,0.4)] text-center">
                  <span className="block text-[10px] font-bold uppercase text-[#E8A5B8]">Fats</span>
                  <span className="text-lg font-black text-[#F3E8EC]">{targets.fat}g</span>
                  <span className="block text-[9px] text-[#D1A3B3]/60">{Math.round(targets.fat * 9)} kcal</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* SECTION 2: PROGRESS & HEATMAP CALENDAR     */}
        {/* ========================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 bg-[#2E1019] rounded-3xl p-6 shadow-[8px_8px_20px_rgba(18,6,10,0.7),-8px_-8px_20px_rgba(74,24,38,0.6)] border border-[#4A1826]/50 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#3D1421] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4)] text-[#E8A5B8]">
                  <PremiumIcons.Progress />
                </div>
                <div>
                  <h3 className="text-base font-medium tracking-wide text-[#F3E8EC]">
                    <span className="text-[#D1A3B3]/40 font-light mr-1.5">02 /</span>
                    Progress Dashboard
                  </h3>
                </div>
              </div>

              {(() => {
                const diff = targets.calories - consumed.calories;
                const isOver = diff < 0;
                return (
                  <div
                    className={`px-3 py-1 rounded-2xl text-xs font-bold shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4)] ${
                      isOver ? 'bg-[#3D1421] text-rose-400' : 'bg-[#3D1421] text-[#E8A5B8]'
                    }`}
                  >
                    {isOver ? `${Math.abs(diff)} kcal over` : `${diff} kcal left`}
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-auto">
              <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-[#250C13] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.6)]">
                <CalorieRing consumed={consumed.calories} target={targets.calories} />
              </div>

              <div className="sm:col-span-7 space-y-3">
                <MacroBar
                  label="Protein"
                  icon={<PremiumIcons.Beef />}
                  consumed={consumed.protein}
                  target={targets.protein}
                  unit="g"
                />
                <MacroBar
                  label="Carbohydrates"
                  icon={<PremiumIcons.Wheat />}
                  consumed={consumed.carbs}
                  target={targets.carbs}
                  unit="g"
                />
                <MacroBar
                  label="Healthy Fats"
                  icon={<PremiumIcons.Droplet />}
                  consumed={consumed.fat}
                  target={targets.fat}
                  unit="g"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-[#2E1019] rounded-3xl p-6 shadow-[8px_8px_20px_rgba(18,6,10,0.7),-8px_-8px_20px_rgba(74,24,38,0.6)] border border-[#4A1826]/50 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#3D1421] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4)] text-[#E8A5B8]">
                <PremiumIcons.Split />
              </div>
              <h3 className="text-base font-medium tracking-wide text-[#F3E8EC]">
                <span className="text-[#D1A3B3]/40 font-light mr-1.5">03 /</span>
                Macro Split
              </h3>
            </div>

            <div className="flex flex-col items-center justify-center my-auto py-2">
              <DonutChart
                proteinCal={macroCalorieSplit.pCal}
                carbsCal={macroCalorieSplit.cCal}
                fatCal={macroCalorieSplit.fCal}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#3D1421] text-center">
              <div className="p-2 rounded-2xl bg-[#250C13] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                <span className="text-[10px] font-bold text-[#E8A5B8]">Protein</span>
                <div className="text-xs font-black text-[#F3E8EC]">{macroCalorieSplit.pPct}%</div>
              </div>
              <div className="p-2 rounded-2xl bg-[#250C13] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                <span className="text-[10px] font-bold text-amber-300">Carbs</span>
                <div className="text-xs font-black text-[#F3E8EC]">{macroCalorieSplit.cPct}%</div>
              </div>
              <div className="p-2 rounded-2xl bg-[#250C13] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                <span className="text-[10px] font-bold text-sky-300">Fats</span>
                <div className="text-xs font-black text-[#F3E8EC]">{macroCalorieSplit.fPct}%</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#2E1019] rounded-3xl p-5 shadow-[8px_8px_20px_rgba(18,6,10,0.7),-8px_-8px_20px_rgba(74,24,38,0.6)] border border-[#4A1826]/50 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#3D1421] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4)] text-[#E8A5B8]">
                  <PremiumIcons.Calendar />
                </div>
                <span className="text-sm font-medium text-[#F3E8EC]">
                  <span className="text-[#D1A3B3]/40 font-light mr-1.5">04 /</span>
                  {calendarDaysData.yearLabel} Heatmap
                </span>
              </div>
            </div>

            <div className="bg-[#250C13] p-3 rounded-2xl shadow-[inset_3px_3px_7px_rgba(0,0,0,0.75),inset_-2px_-2px_5px_rgba(74,24,38,0.3)] flex-1 flex flex-col justify-between gap-2">
              <div className="overflow-hidden pb-1 w-full">
                <div className="flex flex-col w-full">
                  <div className="grid grid-cols-12 mb-1 pl-6 text-[9px] font-bold uppercase tracking-wider text-[#D1A3B3]/80">
                    <span>JAN</span>
                    <span>FEB</span>
                    <span>MAR</span>
                    <span>APR</span>
                    <span>MAY</span>
                    <span>JUN</span>
                    <span>JUL</span>
                    <span>AUG</span>
                    <span>SEP</span>
                    <span>OCT</span>
                    <span>NOV</span>
                    <span>DEC</span>
                  </div>

                  <div className="flex items-stretch gap-1 w-full">
                    <div className="grid grid-rows-7 gap-[2px] text-[8px] font-bold text-[#D1A3B3]/60 pr-0.5 leading-none shrink-0">
                      <span className="h-[12px] flex items-center">S</span>
                      <span className="h-[12px] flex items-center">M</span>
                      <span className="h-[12px] flex items-center">T</span>
                      <span className="h-[12px] flex items-center">W</span>
                      <span className="h-[12px] flex items-center">T</span>
                      <span className="h-[12px] flex items-center">F</span>
                      <span className="h-[12px] flex items-center">S</span>
                    </div>

                    <div className="grid grid-rows-7 grid-flow-col gap-[2px] flex-1 w-full">
                      {Array.from({ length: calendarDaysData.firstDayIndex }).map((_, i) => (
                        <div
                          key={`pad_start_${i}`}
                          className="w-full h-[12px] rounded-[2px] bg-[#2E1019]/60 border border-[#3D1421]/40"
                        />
                      ))}

                      {calendarDaysData.days.map((item) => {
                        const isSelected = selectedDateKey === item.dateKey;
                        let squareColor = 'bg-[#F8FAFC] hover:brightness-90';
                        if (item.status === 'complete') {
                          squareColor = 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.55)] hover:bg-emerald-400';
                        } else if (item.status === 'more-than-half') {
                          squareColor = 'bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.5)] hover:bg-amber-300';
                        }

                        return (
                          <button
                            key={item.dateKey}
                            type="button"
                            onClick={() => setSelectedDateKey(item.dateKey)}
                            title={`${item.dateKey}: ${item.calories} / ${targets.calories} kcal (${Math.round(
                              item.ratio * 100
                            )}%)`}
                            className={`w-full h-[12px] rounded-[2px] transition-transform ${squareColor} ${
                              isSelected
                                ? 'ring-2 ring-[#E8A5B8] ring-offset-1 ring-offset-[#250C13] scale-125 z-10'
                                : 'hover:scale-110'
                            }`}
                          />
                        );
                      })}

                      {Array.from({ length: calendarDaysData.trailingPad }).map((_, i) => (
                        <div
                          key={`pad_end_${i}`}
                          className="w-full h-[12px] rounded-[2px] bg-[#2E1019]/60 border border-[#3D1421]/40"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full flex items-center justify-between gap-2 pt-1.5 border-t border-[#3D1421]/80 text-[10px] text-[#D1A3B3]/80">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-[#E8A5B8]">{selectedDateKey}</span>
                  <span className="text-[#5C1D2F]">•</span>
                  <span className="text-[#F3E8EC] font-semibold">{consumed.calories} kcal</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] text-[#D1A3B3]/60">Less</span>
                  <span className="w-[10px] h-[10px] rounded-[2px] bg-[#F8FAFC] inline-block" title="< 50%" />
                  <span className="w-[10px] h-[10px] rounded-[2px] bg-amber-400 inline-block" title="50%+ (Yellow)" />
                  <span className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500 inline-block" title="100% Complete (Green)" />
                  <span className="text-[9px] text-[#D1A3B3]/60">More</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-2xl bg-[#250C13] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                <span className="text-[10px] font-bold text-emerald-400">100% Days</span>
                <div className="text-xs font-black text-[#F3E8EC]">{calendarDaysData.completeCount}</div>
              </div>
              <div className="p-2 rounded-2xl bg-[#250C13] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                <span className="text-[10px] font-bold text-amber-300">50%+ Days</span>
                <div className="text-xs font-black text-[#F3E8EC]">{calendarDaysData.halfCount}</div>
              </div>
              <div className="p-2 rounded-2xl bg-[#250C13] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                <span className="text-[10px] font-bold text-[#E8A5B8]">Span</span>
                <div className="text-xs font-black text-[#F3E8EC]">12 Months</div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* SECTION 3: MEAL PLANNER & DATABASE         */}
        {/* ========================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-[#2E1019] rounded-3xl p-6 shadow-[8px_8px_20px_rgba(18,6,10,0.7),-8px_-8px_20px_rgba(74,24,38,0.6)] border border-[#4A1826]/50 space-y-4 lg:sticky lg:top-20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#3D1421] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4)] text-[#E8A5B8]">
                  <PremiumIcons.Food />
                </div>
                <h3 className="text-base font-medium tracking-wide text-[#F3E8EC]">
                  <span className="text-[#D1A3B3]/40 font-light mr-1.5">05 /</span>
                  Food Database
                </h3>
              </div>

              <button
                onClick={() => {
                  setCustomFood((prev) => ({ ...prev, targetMeal: activeMealToAdd }));
                  setShowCustomFoodModal(true);
                }}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-2xl bg-[#3D1421] hover:bg-[#4A1826] text-[#E8A5B8] shadow-[4px_4px_10px_rgba(18,6,10,0.6),-4px_-4px_10px_rgba(74,24,38,0.5)] transition shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Custom</span>
              </button>
            </div>

            <div className="bg-[#250C13] p-1.5 rounded-2xl shadow-[inset_3px_3px_6px_rgba(0,0,0,0.6)] grid grid-cols-4 gap-1">
              {MEAL_SECTIONS.map((m) => {
                const isTarget = activeMealToAdd === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMealToAdd(m.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                      isTarget
                        ? 'bg-[#3D1421] text-[#E8A5B8] shadow-[2px_2px_5px_rgba(18,6,10,0.6)]'
                        : 'text-[#D1A3B3]/60 hover:text-[#F3E8EC]'
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span className="truncate max-w-full">{m.id.charAt(0).toUpperCase() + m.id.slice(1)}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#D1A3B3]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chicken, paneer, oats, dal, rice..."
                className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-[#250C13] border-none text-sm text-[#F3E8EC] placeholder-[#D1A3B3]/40 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.6),inset_-3px_-3px_6px_rgba(74,24,38,0.4)] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#D1A3B3]"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition ${
                    selectedCategory === cat
                      ? 'bg-[#3D1421] text-[#E8A5B8] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)]'
                      : 'bg-[#250C13] text-[#D1A3B3]/60 hover:text-[#F3E8EC]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {filteredFoods.map((food) => {
                const servVal = quickAddServings[food.id] ?? 1;
                return (
                  <div
                    key={food.id}
                    className="p-3 rounded-2xl bg-[#250C13] shadow-[4px_4px_10px_rgba(18,6,10,0.5),-4px_-4px_10px_rgba(74,24,38,0.4)] hover:shadow-[2px_2px_5px_rgba(18,6,10,0.7)] transition flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{food.emoji}</span>
                        <h4 className="text-xs sm:text-sm font-bold text-[#F3E8EC] truncate">{food.name}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px] text-[#D1A3B3]/70">
                        <span className="font-medium text-[#F3E8EC]">{food.serving}</span>
                        <span>•</span>
                        <span className="font-bold text-[#E8A5B8]">{food.calories} kcal</span>
                        <span className="text-rose-300">P:{food.protein}g</span>
                        <span className="text-amber-300">C:{food.carbs}g</span>
                        <span className="text-sky-300">F:{food.fat}g</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <select
                        aria-label={`Servings for ${food.name}`}
                        value={servVal}
                        onChange={(e) =>
                          setQuickAddServings((prev) => ({
                            ...prev,
                            [food.id]: parseFloat(e.target.value)
                          }))
                        }
                        className="px-1 py-1.5 rounded-xl bg-[#2E1019] text-[#F3E8EC] border-none text-xs font-bold shadow-[inset_2px_2px_4px_rgba(0,0,0,0.6)] focus:outline-none"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={1}>1x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                        <option value={3}>3x</option>
                      </select>

                      <button
                        onClick={() => handleAddFoodToMeal(food.id, activeMealToAdd, servVal)}
                        className="p-2 rounded-2xl bg-[#3D1421] hover:bg-[#4A1826] text-[#E8A5B8] shadow-[3px_3px_8px_rgba(18,6,10,0.6),-3px_-3px_8px_rgba(74,24,38,0.5)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)] transition"
                        title={`Add to ${activeMealToAdd}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            {MEAL_SECTIONS.map((section) => {
              const mealItems = meals[section.id] || [];
              const mealTotals = consumed.byMeal[section.id] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
              const isSelectedSlot = activeMealToAdd === section.id;

              return (
                <div
                  key={section.id}
                  onClick={() => setActiveMealToAdd(section.id)}
                  className={`bg-[#2E1019] rounded-3xl p-5 transition-all shadow-[8px_8px_20px_rgba(18,6,10,0.7),-8px_-8px_20px_rgba(74,24,38,0.6)] border cursor-pointer ${
                    isSelectedSlot ? 'border-[#E8A5B8]/60 ring-1 ring-[#E8A5B8]/30' : 'border-[#4A1826]/50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#3D1421]">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{section.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-[#F3E8EC]">{section.title}</h4>
                          {isSelectedSlot && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#3D1421] text-[#E8A5B8] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.4)]">
                              Active Slot
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[#D1A3B3]/60">{section.timeHint}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-xl bg-[#250C13] font-bold text-[#F3E8EC] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                        {mealTotals.calories} kcal
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-[#250C13] text-rose-300 font-bold shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                        P:{mealTotals.protein}g
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-[#250C13] text-amber-300 font-bold shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                        C:{mealTotals.carbs}g
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-[#250C13] text-sky-300 font-bold shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                        F:{mealTotals.fat}g
                      </span>
                    </div>
                  </div>

                  {mealItems.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#D1A3B3]/50">
                      No foods logged in {section.title} yet. Click any item on the left to log it here!
                    </div>
                  ) : (
                    <div className="divide-y divide-[#3D1421] mt-2">
                      {mealItems.map((entry) => {
                        const food = foodDb.find((f) => f.id === entry.foodId);
                        if (!food) return null;
                        const itemCal = Math.round(food.calories * entry.servings);

                        return (
                          <div
                            key={entry.uid}
                            onClick={(e) => e.stopPropagation()}
                            className="py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span>{food.emoji}</span>
                                <span className="text-sm font-bold text-[#F3E8EC]">{food.name}</span>
                              </div>
                              <div className="text-xs text-[#D1A3B3]/70 mt-0.5 flex flex-wrap items-center gap-x-2.5">
                                <span>Unit: {food.serving} × {entry.servings}</span>
                                <span>•</span>
                                <span className="font-bold text-[#E8A5B8]">{itemCal} kcal</span>
                                <span className="text-rose-300">P:{Math.round(food.protein * entry.servings * 10) / 10}g</span>
                                <span className="text-amber-300">C:{Math.round(food.carbs * entry.servings * 10) / 10}g</span>
                                <span className="text-sky-300">F:{Math.round(food.fat * entry.servings * 10) / 10}g</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center bg-[#250C13] rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleStepServings(section.id, entry.uid, -0.5)}
                                  className="w-7 h-7 rounded-xl hover:bg-[#3D1421] text-xs font-bold text-[#F3E8EC] transition"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0.25"
                                  max="20"
                                  step="0.25"
                                  value={entry.servings}
                                  onChange={(e) => handleUpdateServings(section.id, entry.uid, e.target.value)}
                                  className="w-12 text-center bg-transparent text-xs font-bold text-[#F3E8EC] focus:outline-none"
                                  aria-label="Portion size"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleStepServings(section.id, entry.uid, 0.5)}
                                  className="w-7 h-7 rounded-xl hover:bg-[#3D1421] text-xs font-bold text-[#F3E8EC] transition"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveMealItem(section.id, entry.uid)}
                                className="p-2 rounded-2xl text-[#D1A3B3]/50 hover:text-rose-400 hover:bg-[#3D1421] transition"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ========================================== */}
      {/* CUSTOM FOOD MODAL                          */}
      {/* ========================================== */}
      {showCustomFoodModal && (
        <div className="fixed inset-0 z-50 bg-[#12060A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#2E1019] rounded-3xl max-w-md w-full p-6 shadow-[15px_15px_30px_rgba(0,0,0,0.8),-15px_-15px_30px_rgba(74,24,38,0.7)] border border-[#4A1826] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#F3E8EC] flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#E8A5B8]" />
                <span>Add Custom Food Item</span>
              </h3>
              <button
                onClick={() => setShowCustomFoodModal(false)}
                className="text-[#D1A3B3] hover:text-[#F3E8EC] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomFood} className="space-y-3.5">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#D1A3B3] mb-1">Icon</label>
                  <select
                    value={customFood.emoji}
                    onChange={(e) => setCustomFood({ ...customFood, emoji: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-2xl bg-[#250C13] border-none text-base text-[#F3E8EC] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] focus:outline-none"
                  >
                    <option value="🍽️">🍽️</option>
                    <option value="🥗">🥗</option>
                    <option value="🍲">🍲</option>
                    <option value="🥩">🥩</option>
                    <option value="🥪">🥪</option>
                    <option value="🥤">🥤</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-[11px] font-bold uppercase text-[#D1A3B3] mb-1">Food Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Protein Shake"
                    value={customFood.name}
                    onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-[#250C13] border-none text-sm font-bold text-[#F3E8EC] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#D1A3B3] mb-1">Serving Size</label>
                  <input
                    type="text"
                    placeholder="e.g., 1 scoop (35g)"
                    value={customFood.serving}
                    onChange={(e) => setCustomFood({ ...customFood, serving: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-[#250C13] border-none text-sm text-[#F3E8EC] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#D1A3B3] mb-1">Calories</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Auto from macros"
                    value={customFood.calories}
                    onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-[#250C13] border-none text-sm text-[#F3E8EC] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-rose-300 mb-1">Protein (g)*</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    placeholder="25"
                    value={customFood.protein}
                    onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-[#250C13] border-none text-sm font-bold text-[#F3E8EC] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-amber-300 mb-1">Carbs (g)*</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    placeholder="10"
                    value={customFood.carbs}
                    onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-[#250C13] border-none text-sm font-bold text-[#F3E8EC] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-sky-300 mb-1">Fats (g)*</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    placeholder="5"
                    value={customFood.fat}
                    onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-[#250C13] border-none text-sm font-bold text-[#F3E8EC] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#D1A3B3] mb-1">Log into Slot</label>
                  <select
                    value={customFood.targetMeal}
                    onChange={(e) => setCustomFood({ ...customFood, targetMeal: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-[#250C13] border-none text-sm text-[#F3E8EC] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] focus:outline-none"
                  >
                    {MEAL_SECTIONS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.icon} {m.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#D1A3B3] mb-1">Portions</label>
                  <input
                    type="number"
                    min="0.25"
                    step="0.25"
                    value={customFood.initialServings}
                    onChange={(e) => setCustomFood({ ...customFood, initialServings: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-[#250C13] border-none text-sm font-bold text-[#F3E8EC] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3D1421]">
                <button
                  type="button"
                  onClick={() => setShowCustomFoodModal(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-bold bg-[#250C13] text-[#D1A3B3] shadow-[4px_4px_10px_rgba(18,6,10,0.5)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-2xl text-xs font-bold bg-[#3D1421] text-[#E8A5B8] shadow-[4px_4px_10px_rgba(18,6,10,0.6)]"
                >
                  Save & Log Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CalorieRing({ consumed, target }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const rawPct = target > 0 ? (consumed / target) * 100 : 0;
  const clampedPct = Math.min(100, Math.max(0, rawPct));
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;
  const isOver = consumed > target;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="transparent"
          stroke="#250C13"
          strokeWidth="12"
          className="shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="transparent"
          stroke={isOver ? '#f43f5e' : '#E8A5B8'}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D1A3B3]">Eaten</span>
        <span className="text-2xl font-black tracking-tight text-[#F3E8EC]">{consumed}</span>
        <span className="text-[11px] font-bold text-[#E8A5B8]">{Math.round(rawPct)}%</span>
      </div>
    </div>
  );
}

function MacroBar({ label, icon, consumed, target, unit }) {
  const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
  const remaining = Math.round((target - consumed) * 10) / 10;
  const isOver = remaining < 0;

  return (
    <div className="p-3.5 rounded-2xl bg-[#250C13] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-bold text-[#F3E8EC]">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-[#F3E8EC]">{consumed}g</span>
          <span className="text-[11px] text-[#D1A3B3]/60"> / {target}{unit}</span>
        </div>
      </div>

      <div className="w-full h-2 bg-[#2E1019] rounded-full overflow-hidden shadow-[inset_1px_1px_3px_rgba(0,0,0,0.8)]">
        <div
          className="h-full bg-gradient-to-r from-[#5C1D2F] to-[#E8A5B8] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-1.5 text-[10px] text-[#D1A3B3]/70">
        <span>{Math.round(consumed * (label === 'Healthy Fats' ? 9 : 4))} kcal</span>
        <span className={isOver ? 'text-rose-400 font-bold' : ''}>
          {isOver ? `${Math.abs(remaining)}g over` : `${remaining}g left`}
        </span>
      </div>
    </div>
  );
}

function DonutChart({ proteinCal, carbsCal, fatCal }) {
  const total = proteinCal + carbsCal + fatCal;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  if (total <= 0) {
    return (
      <div className="w-36 h-36 rounded-3xl bg-[#250C13] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.6)] flex items-center justify-center text-center p-4">
        <span className="text-xs text-[#D1A3B3]/50">Log meals for split</span>
      </div>
    );
  }

  const pLen = (proteinCal / total) * circumference;
  const cLen = (carbsCal / total) * circumference;
  const fLen = (fatCal / total) * circumference;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="transparent"
          stroke="#E8A5B8"
          strokeWidth="14"
          strokeDasharray={`${pLen} ${circumference}`}
          strokeDashoffset={0}
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="transparent"
          stroke="#fde047"
          strokeWidth="14"
          strokeDasharray={`${cLen} ${circumference}`}
          strokeDashoffset={-pLen}
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="transparent"
          stroke="#38bdf8"
          strokeWidth="14"
          strokeDasharray={`${fLen} ${circumference}`}
          strokeDashoffset={-(pLen + cLen)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[9px] font-bold uppercase text-[#D1A3B3]">Total</span>
        <span className="text-sm font-black text-[#F3E8EC]">{total}</span>
        <span className="text-[9px] text-[#D1A3B3]/60">kcal</span>
      </div>
    </div>
  );
}