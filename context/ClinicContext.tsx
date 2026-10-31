import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { ImageSourcePropType } from 'react-native';

import { startOfDay } from '../utils/clinic';
import { Medication, MedicationDraft } from './MedicationsContext';

export type PatientStatus = 'adherent' | 'stable' | 'needsFollowUp';
export type DoseMark = 'taken' | 'missed' | 'pending';
export type AppointmentStatus = 'confirmed' | 'pending' | 'needsFollowUp' | 'completed' | 'cancelled';
export type NoteKind = 'diagnosis' | 'followUp' | 'relative';
export type VisitTag = 'followUp' | 'goodResult' | 'prescription' | 'urgent';

export type ClinicMedication = Medication & { adherence: number };

export type Relative = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  avatar?: ImageSourcePropType;
  pending?: boolean;
  invitedAt?: number;
};

export type Visit = {
  id: string;
  title: string;
  tag: VisitTag;
  tagLabel: string;
  date: number;
  note: string;
};

export type PatientNote = {
  id: string;
  author: string;
  kind: NoteKind;
  at: number;
  text: string;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  fileNo: string;
  gender: 'female' | 'male';
  phone: string;
  avatar?: ImageSourcePropType;
  summary: string;
  diseases: string[];
  adherence: number;
  status: PatientStatus;
  tags: ('chronic' | 'new')[];
  relatives: Relative[];
  medications: ClinicMedication[];
  visits: Visit[];
  notes: PatientNote[];
  /** Per medication: one row per daily dose, 7 columns starting Saturday (index 0 = س). */
  doseLogs: Record<string, DoseMark[][]>;
};

export type Appointment = {
  id: string;
  patientId: string;
  reason: string;
  visitType: string;
  durationMin: number;
  startsAt: number;
  status: AppointmentStatus;
  notes: PatientNote[];
};

export type Invite = {
  id: string;
  name: string;
  contact: string;
  kind: 'phone' | 'username';
  avatar?: ImageSourcePropType;
  sentAt: number;
  status: 'sent' | 'accepted';
};

export type ActiveSession = {
  appointmentId: string;
  patientId: string;
  startedAt: number;
  draftNote: string;
  prescriptions: string[];
};

export type SessionSummary = {
  patientId: string;
  patientName: string;
  notesCount: number;
  prescriptions: string[];
  nextAppointmentAt: number | null;
};

export const DOCTOR = {
  name: 'د. أحمد',
  avatar: require('../assets/figma/avatar-ahmed-541de5.png') as ImageSourcePropType,
};

export const REGISTERED_COUNT = 248;
export const CLINIC_ADHERENCE = 85;

const MAN = require('../assets/avatars/man-bw.jpg') as ImageSourcePropType;
const WOMAN_DARK = require('../assets/avatars/woman-black-top.jpg') as ImageSourcePropType;
const ELDER_WOMAN = require('../assets/avatars/elder-woman.jpg') as ImageSourcePropType;
const WOMAN_BLUE = require('../assets/avatars/woman-portrait.jpg') as ImageSourcePropType;

const TODAY = startOfDay(Date.now());

function at(dayOffset: number, hour: number, minute = 0): number {
  const date = new Date(TODAY);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
}

function med(
  id: string,
  adherence: number,
  base: Pick<Medication, 'name' | 'form' | 'unit' | 'frequency' | 'times' | 'mealTiming'> &
    Partial<Medication>
): ClinicMedication {
  return {
    quantity: 1,
    notes: '',
    duration: 'ongoing',
    startDate: at(-60, 0),
    stock: 30,
    lowStockAlert: true,
    status: 'active',
    ...base,
    id,
    adherence,
  };
}

const T = 'taken' as const;
const M = 'missed' as const;
const P = 'pending' as const;

const SUAD_MEDICATIONS: ClinicMedication[] = [
  med('suad-m1', 90, {
    name: 'ميتفورمين ٥٠٠ مجم',
    form: 'tablet',
    unit: 'قرص',
    frequency: 2,
    times: [8 * 60, 20 * 60],
    mealTiming: 'after',
    notes: 'يؤخذ بعد الأكل مع كوب ماء',
    stock: 60,
  }),
  med('suad-m2', 88, {
    name: 'أملوديبين ٥ مجم',
    form: 'tablet',
    unit: 'قرص',
    frequency: 1,
    times: [9 * 60],
    mealTiming: 'before',
    customTiming: 'صباحًا',
  }),
  med('suad-m3', 70, {
    name: 'أوميبرازول ٢٠ مجم',
    form: 'capsule',
    unit: 'كبسولة',
    frequency: 1,
    times: [7 * 60],
    mealTiming: 'before',
    customTiming: 'قبل الفطار',
    stock: 14,
  }),
  med('suad-m4', 100, {
    name: 'فيتامين د٣',
    form: 'capsule',
    unit: 'كبسولة',
    frequency: 1,
    times: [12 * 60],
    mealTiming: 'with',
    weeklyDay: 5,
    duration: 30,
    stock: 0,
  }),
];

const PATIENTS_SEED: Patient[] = [
  {
    id: 'p-suad',
    name: 'سعاد محمود',
    age: 72,
    fileNo: '2048',
    gender: 'female',
    phone: '01012345678',
    avatar: ELDER_WOMAN,
    summary: 'سكر النوع الثاني · ضغط مرتفع',
    diseases: ['التهاب في الرقبة', 'مرض السكري', 'الربو', 'هشاشة العظام', 'مرض الزهايمر'],
    adherence: 92,
    status: 'adherent',
    tags: ['chronic'],
    relatives: [
      { id: 'r-layla-m', name: 'ليلى مراد', relation: 'ابنة', phone: '01234567890', avatar: WOMAN_DARK },
      { id: 'r-youssef-m', name: 'يوسف محمود', relation: 'ابن', phone: '01098765432', avatar: MAN },
      {
        id: 'r-yasmin',
        name: 'ياسمين أحمد',
        relation: 'حفيدة',
        phone: '01155501234',
        avatar: WOMAN_BLUE,
        pending: true,
        invitedAt: at(0, 8),
      },
    ],
    medications: SUAD_MEDICATIONS,
    visits: [
      {
        id: 'v1',
        title: 'متابعة دورية',
        tag: 'followUp',
        tagLabel: 'متابعة',
        date: at(-1, 10),
        note: 'رُفعت جرعة الأملوديبين إلى ٥ مجم بعد ارتفاع قراءات الضغط.',
      },
      {
        id: 'v2',
        title: 'تحاليل',
        tag: 'goodResult',
        tagLabel: 'نتيجة جيدة',
        date: new Date(2026, 8, 12).getTime(),
        note: 'سكر تراكمي ٧,٢٪ — تحسّن واضح عن المرة السابقة.',
      },
      {
        id: 'v3',
        title: 'زيارة جديدة',
        tag: 'prescription',
        tagLabel: 'وصفة',
        date: new Date(2026, 6, 25).getTime(),
        note: 'أضيف أوميبرازول ٢٠ مجم لعلاج الحموضة المتكررة.',
      },
      {
        id: 'v4',
        title: 'طوارئ',
        tag: 'urgent',
        tagLabel: 'عاجل',
        date: new Date(2026, 4, 2).getTime(),
        note: 'ارتفاع حاد في السكر، وتم ضبطه خلال ٣ أيام.',
      },
    ],
    notes: [
      {
        id: 'n1',
        author: 'د. منى الشريف',
        kind: 'diagnosis',
        at: at(0, 9, 50),
        text: 'ضغط الدم أعلى قليلًا من المعتاد، والمريضة ملتزمة بالدواء.',
      },
      {
        id: 'n2',
        author: 'د. منى الشريف',
        kind: 'followUp',
        at: at(0, 9, 55),
        text: 'متابعة القياس بعد أسبوعين وإعادة تقييم جرعة الأملوديبين.',
      },
      {
        id: 'n3',
        author: 'ليلى مراد · قريب',
        kind: 'relative',
        at: at(-1, 18, 30),
        text: 'والدتي تشتكي من دوخة خفيفة بعد جرعة الصباح.',
      },
    ],
    doseLogs: {
      'suad-m1': [
        [T, T, T, M, T, T, P],
        [T, T, T, T, T, T, P],
      ],
      'suad-m2': [[T, T, T, T, T, T, P]],
      'suad-m3': [[T, T, T, T, T, T, P]],
    },
  },
  {
    id: 'p-mohamed',
    name: 'محمد عبد الله',
    age: 68,
    fileNo: '1976',
    gender: 'male',
    phone: '01011112222',
    avatar: MAN,
    summary: 'قصور قلب',
    diseases: ['قصور القلب', 'ضغط مرتفع'],
    adherence: 92,
    status: 'adherent',
    tags: ['chronic'],
    relatives: [
      { id: 'r-amal', name: 'أمل عبد الله', relation: 'ابنة', phone: '01022223333', avatar: WOMAN_BLUE },
      { id: 'r-karim', name: 'كريم عبد الله', relation: 'ابن', phone: '01033334444', avatar: MAN },
    ],
    medications: [
      med('mohamed-m1', 92, {
        name: 'إنالابريل ٥ مجم',
        form: 'tablet',
        unit: 'قرص',
        frequency: 1,
        times: [8 * 60],
        mealTiming: 'before',
        customTiming: 'صباحًا',
      }),
    ],
    visits: [],
    notes: [],
    doseLogs: {},
  },
  {
    id: 'p-hassan',
    name: 'حسن إبراهيم',
    age: 75,
    fileNo: '1852',
    gender: 'male',
    phone: '01044445555',
    avatar: MAN,
    summary: 'ضغط · سكر',
    diseases: ['ضغط مرتفع', 'مرض السكري'],
    adherence: 52,
    status: 'needsFollowUp',
    tags: ['chronic'],
    relatives: [
      { id: 'r-layla-a', name: 'ليلى أحمد', relation: 'زوجة', phone: '01055556666', avatar: WOMAN_DARK },
      { id: 'r-omar', name: 'عمر إبراهيم', relation: 'ابن', phone: '01066667777', avatar: MAN },
    ],
    medications: [
      med('hassan-m1', 52, {
        name: 'ميتفورمين ٥٠٠ مجم',
        form: 'tablet',
        unit: 'قرص',
        frequency: 2,
        times: [8 * 60, 20 * 60],
        mealTiming: 'after',
      }),
    ],
    visits: [],
    notes: [],
    doseLogs: {},
  },
  {
    id: 'p-fatma',
    name: 'فاطمة علي',
    age: 58,
    fileNo: '2210',
    gender: 'female',
    phone: '01077778888',
    avatar: WOMAN_DARK,
    summary: 'سكر',
    diseases: ['مرض السكري'],
    adherence: 88,
    status: 'stable',
    tags: ['chronic'],
    relatives: [{ id: 'r-hoda', name: 'هدى علي', relation: 'أخت', phone: '01088889999', avatar: WOMAN_BLUE }],
    medications: [
      med('fatma-m1', 88, {
        name: 'جليبنكلاميد ٥ مجم',
        form: 'tablet',
        unit: 'قرص',
        frequency: 1,
        times: [8 * 60],
        mealTiming: 'before',
        customTiming: 'قبل الفطار',
      }),
    ],
    visits: [],
    notes: [],
    doseLogs: {},
  },
  {
    id: 'p-layla',
    name: 'ليلى محمود',
    age: 45,
    fileNo: '2330',
    gender: 'female',
    phone: '01099990000',
    avatar: WOMAN_DARK,
    summary: 'أملوديبين ٥ مجم',
    diseases: ['ضغط مرتفع'],
    adherence: 92,
    status: 'stable',
    tags: ['new'],
    relatives: [{ id: 'r-ahmed-s', name: 'أحمد سالم', relation: 'زوج', phone: '01012120000', avatar: MAN }],
    medications: [
      med('layla-m1', 92, {
        name: 'أملوديبين ٥ مجم',
        form: 'tablet',
        unit: 'قرص',
        frequency: 1,
        times: [9 * 60],
        mealTiming: 'before',
        customTiming: 'صباحًا',
      }),
    ],
    visits: [],
    notes: [],
    doseLogs: {},
  },
  {
    id: 'p-youssef',
    name: 'يوسف أحمد',
    age: 34,
    fileNo: '2402',
    gender: 'male',
    phone: '01023456789',
    avatar: MAN,
    summary: 'ربو',
    diseases: ['الربو'],
    adherence: 100,
    status: 'stable',
    tags: ['new'],
    relatives: [],
    medications: [],
    visits: [],
    notes: [],
    doseLogs: {},
  },
];

const APPOINTMENTS_SEED: Appointment[] = [
  {
    id: 'a1',
    patientId: 'p-suad',
    reason: 'متابعة سكر وضغط',
    visitType: 'متابعة دورية',
    durationMin: 30,
    startsAt: at(0, 9, 30),
    status: 'confirmed',
    notes: [
      {
        id: 'an1',
        author: 'ليلى مراد · قريب',
        kind: 'relative',
        at: at(-1, 18, 30),
        text: 'والدتي تشتكي من دوخة خفيفة بعد جرعة الصباح.',
      },
    ],
  },
  {
    id: 'a2',
    patientId: 'p-mohamed',
    reason: 'مراجعة قصور القلب',
    visitType: 'مراجعة',
    durationMin: 30,
    startsAt: at(0, 11),
    status: 'pending',
    notes: [],
  },
  {
    id: 'a3',
    patientId: 'p-fatma',
    reason: 'مراجعة تحاليل السكر',
    visitType: 'مراجعة تحاليل',
    durationMin: 20,
    startsAt: at(0, 12),
    status: 'confirmed',
    notes: [],
  },
  {
    id: 'a4',
    patientId: 'p-hassan',
    reason: 'التزام منخفض بالدواء',
    visitType: 'متابعة دورية',
    durationMin: 30,
    startsAt: at(0, 14, 30),
    status: 'needsFollowUp',
    notes: [],
  },
  {
    id: 'a5',
    patientId: 'p-layla',
    reason: 'متابعة ضغط',
    visitType: 'متابعة دورية',
    durationMin: 30,
    startsAt: at(-1, 10, 30),
    status: 'completed',
    notes: [],
  },
  {
    id: 'a6',
    patientId: 'p-layla',
    reason: 'مراجعة تحاليل',
    visitType: 'مراجعة تحاليل',
    durationMin: 20,
    startsAt: at(1, 10, 30),
    status: 'confirmed',
    notes: [],
  },
  {
    id: 'a7',
    patientId: 'p-hassan',
    reason: 'قياس ضغط',
    visitType: 'متابعة دورية',
    durationMin: 15,
    startsAt: at(1, 14),
    status: 'cancelled',
    notes: [],
  },
  {
    id: 'a8',
    patientId: 'p-suad',
    reason: 'متابعة بعد تعديل الجرعة',
    visitType: 'متابعة دورية',
    durationMin: 30,
    startsAt: at(21, 9, 30),
    status: 'confirmed',
    notes: [],
  },
];

const INVITES_SEED: Invite[] = [
  {
    id: 'i1',
    name: 'يوسف أحمد',
    contact: '01023456789',
    kind: 'phone',
    avatar: MAN,
    sentAt: at(0, 8),
    status: 'accepted',
  },
  {
    id: 'i2',
    name: 'نادية كامل',
    contact: '01112345678',
    kind: 'phone',
    avatar: WOMAN_DARK,
    sentAt: at(-3, 12),
    status: 'sent',
  },
];

const ARABIC_DIGITS = /[٠-٩]/g;

export function normalizeSearch(text: string): string {
  return text
    .replace(ARABIC_DIGITS, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim()
    .toLowerCase();
}

export type SearchResult = {
  patients: Patient[];
  relatives: { relative: Relative; patient: Patient }[];
};

type NewAppointment = { patientId: string; title: string; notes: string; startsAt: number };

type ClinicContextValue = {
  patients: Patient[];
  appointments: Appointment[];
  invites: Invite[];
  session: ActiveSession | null;
  summary: SessionSummary | null;
  getPatient: (id: string) => Patient | undefined;
  getAppointment: (id: string) => Appointment | undefined;
  search: (query: string) => SearchResult;
  addAppointment: (input: NewAppointment) => string;
  rescheduleAppointment: (id: string, startsAt: number) => void;
  addAppointmentNote: (id: string, text: string) => void;
  sendInvite: (input: { kind: 'phone' | 'username'; contact: string; name?: string }) => void;
  cancelInvite: (id: string) => void;
  addPatientMedication: (patientId: string, draft: MedicationDraft) => string;
  addPatientNote: (patientId: string, note: { kind: NoteKind; text: string }) => void;
  startSession: (appointmentId: string) => void;
  setDraftNote: (text: string) => void;
  endSession: () => SessionSummary | null;
};

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(PATIENTS_SEED);
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS_SEED);
  const [invites, setInvites] = useState<Invite[]>(INVITES_SEED);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  const getPatient = useCallback((id: string) => patients.find((patient) => patient.id === id), [patients]);
  const getAppointment = useCallback(
    (id: string) => appointments.find((appointment) => appointment.id === id),
    [appointments]
  );

  const search = useCallback(
    (query: string): SearchResult => {
      const needle = normalizeSearch(query);
      if (!needle) return { patients: [], relatives: [] };
      const matchedPatients = patients.filter(
        (patient) =>
          normalizeSearch(patient.name).includes(needle) ||
          normalizeSearch(patient.fileNo).includes(needle) ||
          patient.relatives.some((relative) => normalizeSearch(relative.name).includes(needle))
      );
      const matchedRelatives = patients.flatMap((patient) =>
        patient.relatives
          .filter((relative) => normalizeSearch(relative.name).includes(needle))
          .map((relative) => ({ relative, patient }))
      );
      return { patients: matchedPatients, relatives: matchedRelatives };
    },
    [patients]
  );

  const addAppointment = useCallback((input: NewAppointment) => {
    const id = `a-${Date.now()}`;
    const notes: PatientNote[] = input.notes.trim()
      ? [{ id: `${id}-n`, author: DOCTOR.name, kind: 'followUp', at: Date.now(), text: input.notes.trim() }]
      : [];
    setAppointments((current) => [
      ...current,
      {
        id,
        patientId: input.patientId,
        reason: input.title.trim(),
        visitType: 'متابعة دورية',
        durationMin: 30,
        startsAt: input.startsAt,
        status: 'confirmed',
        notes,
      },
    ]);
    return id;
  }, []);

  const rescheduleAppointment = useCallback((id: string, startsAt: number) => {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id ? { ...appointment, startsAt, status: 'pending' } : appointment
      )
    );
  }, []);

  const addAppointmentNote = useCallback((id: string, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id
          ? {
              ...appointment,
              notes: [
                { id: `${id}-n-${Date.now()}`, author: DOCTOR.name, kind: 'followUp', at: Date.now(), text: clean },
                ...appointment.notes,
              ],
            }
          : appointment
      )
    );
  }, []);

  const sendInvite = useCallback((input: { kind: 'phone' | 'username'; contact: string; name?: string }) => {
    setInvites((current) => [
      {
        id: `i-${Date.now()}`,
        name: input.name?.trim() || input.contact,
        contact: input.contact,
        kind: input.kind,
        sentAt: Date.now(),
        status: 'sent',
      },
      ...current,
    ]);
  }, []);

  const cancelInvite = useCallback((id: string) => {
    setInvites((current) => current.filter((invite) => invite.id !== id));
  }, []);

  const addPatientMedication = useCallback((patientId: string, draft: MedicationDraft) => {
    const id = `cm-${Date.now()}`;
    setPatients((current) =>
      current.map((patient) =>
        patient.id === patientId
          ? { ...patient, medications: [...patient.medications, { ...draft, id, status: 'active', adherence: 100 }] }
          : patient
      )
    );
    setSession((current) =>
      current && current.patientId === patientId
        ? { ...current, prescriptions: [...current.prescriptions, draft.name] }
        : current
    );
    return id;
  }, []);

  const addPatientNote = useCallback((patientId: string, note: { kind: NoteKind; text: string }) => {
    const text = note.text.trim();
    if (!text) return;
    setPatients((current) =>
      current.map((patient) =>
        patient.id === patientId
          ? {
              ...patient,
              notes: [
                { id: `n-${Date.now()}`, author: DOCTOR.name, kind: note.kind, at: Date.now(), text },
                ...patient.notes,
              ],
            }
          : patient
      )
    );
  }, []);

  const startSession = useCallback(
    (appointmentId: string) => {
      const appointment = appointments.find((item) => item.id === appointmentId);
      if (!appointment) return;
      setSummary(null);
      setSession({
        appointmentId,
        patientId: appointment.patientId,
        startedAt: Date.now(),
        draftNote: '',
        prescriptions: [],
      });
    },
    [appointments]
  );

  const setDraftNote = useCallback((text: string) => {
    setSession((current) => (current ? { ...current, draftNote: text } : current));
  }, []);

  const endSession = useCallback((): SessionSummary | null => {
    if (!session) return null;
    const patient = patients.find((item) => item.id === session.patientId);
    if (!patient) return null;

    const text = session.draftNote.trim();
    const notesCount = patient.notes.length + (text ? 1 : 0);
    const now = Date.now();
    const next = appointments
      .filter(
        (item) =>
          item.patientId === patient.id &&
          item.id !== session.appointmentId &&
          item.startsAt > now &&
          (item.status === 'confirmed' || item.status === 'pending' || item.status === 'needsFollowUp')
      )
      .sort((a, b) => a.startsAt - b.startsAt)[0];

    const result: SessionSummary = {
      patientId: patient.id,
      patientName: patient.name,
      notesCount,
      prescriptions: session.prescriptions,
      nextAppointmentAt: next ? next.startsAt : null,
    };

    if (text) {
      setPatients((current) =>
        current.map((item) =>
          item.id === patient.id
            ? {
                ...item,
                notes: [{ id: `n-${now}`, author: DOCTOR.name, kind: 'diagnosis', at: now, text }, ...item.notes],
              }
            : item
        )
      );
    }
    setAppointments((current) =>
      current.map((item) => (item.id === session.appointmentId ? { ...item, status: 'completed' } : item))
    );
    setSession(null);
    setSummary(result);
    return result;
  }, [session, patients, appointments]);

  const value = useMemo(
    () => ({
      patients,
      appointments,
      invites,
      session,
      summary,
      getPatient,
      getAppointment,
      search,
      addAppointment,
      rescheduleAppointment,
      addAppointmentNote,
      sendInvite,
      cancelInvite,
      addPatientMedication,
      addPatientNote,
      startSession,
      setDraftNote,
      endSession,
    }),
    [
      patients,
      appointments,
      invites,
      session,
      summary,
      getPatient,
      getAppointment,
      search,
      addAppointment,
      rescheduleAppointment,
      addAppointmentNote,
      sendInvite,
      cancelInvite,
      addPatientMedication,
      addPatientNote,
      startSession,
      setDraftNote,
      endSession,
    ]
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): ClinicContextValue {
  const value = useContext(ClinicContext);
  if (!value) throw new Error('useClinic must be used inside ClinicProvider');
  return value;
}
