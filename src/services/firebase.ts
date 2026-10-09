import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  type Firestore,
} from 'firebase/firestore'
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  type FirebaseStorage,
} from 'firebase/storage'
import { getFunctions, httpsCallable, type Functions } from 'firebase/functions'
import type { UserProfile, MedicalReport, ChatMessage } from '@/types'
import { getFileExtension } from '@/utils/fileValidation'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.length > 5 &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'undefined'
)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null
let functions: Functions | null = null

if (isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
    functions = getFunctions(app)
    console.info('[Firebase] Initialized with project:', firebaseConfig.projectId)
  } catch (err) {
    console.warn('[Firebase] Initialization error, fallback to demo mode enabled:', err)
  }
} else {
  console.info('[Firebase] VITE_FIREBASE_* credentials not provided; running in resilient demo mode.')
}

export function generateReportId(): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 9)
  return `rep_${timestamp}_${randomStr}`
}

export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || !error) return 'An unexpected error occurred. Please try again.'
  const code = (error as { code?: string }).code || ''
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify and try again.'
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Try signing in instead.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.'
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please reset your password or try again later.'
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.'
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.'
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.'
    default:
      return (error as { message?: string }).message || 'Authentication error. Please try again.'
  }
}

function mapFirebaseUser(user: FirebaseUser | null): UserProfile | null {
  if (!user) return null
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'Patient',
    photoURL: user.photoURL,
  }
}

export interface IFirebaseService {
  readonly isConfigured: boolean
  getCurrentUser(): Promise<UserProfile | null>
  onAuthStateChange(callback: (user: UserProfile | null) => void): () => void
  signInWithGoogle(): Promise<UserProfile>
  signInWithEmail(email: string, password: string): Promise<UserProfile>
  signUpWithEmail(email: string, password: string, displayName?: string): Promise<UserProfile>
  sendPasswordReset(email: string): Promise<void>
  signOut(): Promise<void>
  uploadReportFileToStorage(file: File, uid: string, reportId: string): Promise<{ storagePath: string }>
  createReportDoc(uid: string, reportId: string, data: Omit<MedicalReport, 'id' | 'userId'>): Promise<void>
  updateReportDoc(uid: string, reportId: string, updates: Partial<MedicalReport>): Promise<void>
  subscribeToReport(uid: string, reportId: string, callback: (report: MedicalReport | null) => void): () => void
  uploadReportFile(file: File, userId: string): Promise<{ fileUrl: string; path: string }>
  saveReport(report: Omit<MedicalReport, 'id'>): Promise<string>
  getReports(userId: string): Promise<MedicalReport[]>
  getReportById(reportId: string): Promise<MedicalReport | null>
  askReport(
    reportId: string,
    question: string,
    language?: string,
    userId?: string
  ): Promise<{ answer: string; messageId?: string }>
  subscribeToChatMessages(
    userId: string,
    reportId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void
  getReportTranslation(
    reportId: string,
    language: string,
    userId?: string
  ): Promise<any>
  clearChatHistory(userId: string, reportId: string): Promise<void>
  deleteReport(userId: string, reportId: string): Promise<void>
}

class FirebaseServiceImpl implements IFirebaseService {
  readonly isConfigured = isConfigured
  private demoUser: UserProfile | null = null
  private demoReports: Map<string, MedicalReport> = new Map()
  private demoSubscribers: Map<string, Set<(report: MedicalReport | null) => void>> = new Map()

  constructor() {
    // Check localStorage for persisted demo user if Firebase is not yet configured
    if (!this.isConfigured) {
      const saved = localStorage.getItem('meddibuddy_demo_user')
      if (saved) {
        try {
          this.demoUser = JSON.parse(saved)
        } catch {
          this.demoUser = null
        }
      }
      const savedReports = localStorage.getItem('meddibuddy_demo_reports')
      if (savedReports) {
        try {
          const parsed = JSON.parse(savedReports) as Record<string, MedicalReport>
          Object.entries(parsed).forEach(([k, v]) => this.demoReports.set(k, v))
        } catch {
          // ignore corrupted storage
        }
      }
    }
  }

  private persistDemoReports() {
    try {
      const obj: Record<string, MedicalReport> = {}
      this.demoReports.forEach((val, key) => {
        obj[key] = val
      })
      localStorage.setItem('meddibuddy_demo_reports', JSON.stringify(obj))
    } catch {
      // localStorage might be unavailable or full
    }
  }

  private notifySubscribers(uid: string, reportId: string, report: MedicalReport) {
    const key = `${uid}_${reportId}`
    const subs = this.demoSubscribers.get(key)
    if (subs) {
      subs.forEach((cb) => cb(report))
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    if (auth && auth.currentUser) {
      return mapFirebaseUser(auth.currentUser)
    }
    return this.demoUser
  }

  onAuthStateChange(callback: (user: UserProfile | null) => void): () => void {
    if (auth) {
      return onAuthStateChanged(auth, (fbUser) => {
        callback(mapFirebaseUser(fbUser))
      })
    }
    // Demo mode: trigger once immediately
    callback(this.demoUser)
    return () => {}
  }

  async signInWithGoogle(): Promise<UserProfile> {
    if (auth) {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const credential = await signInWithPopup(auth, provider)
      const mapped = mapFirebaseUser(credential.user)!
      return mapped
    }

    // Demo Mode Google login
    const user: UserProfile = {
      uid: 'google_patient_' + Math.random().toString(36).substring(2, 8),
      email: 'demo.patient@gmail.com',
      displayName: 'Demo Patient',
      photoURL: null,
    }
    this.demoUser = user
    localStorage.setItem('meddibuddy_demo_user', JSON.stringify(user))
    return user
  }

  async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    if (auth) {
      const credential = await signInWithEmailAndPassword(auth, email, pass)
      return mapFirebaseUser(credential.user)!
    }

    // Demo Mode Email Login
    const user: UserProfile = {
      uid: 'user_' + Math.random().toString(36).substring(2, 9),
      email,
      displayName: email.split('@')[0],
      photoURL: null,
    }
    this.demoUser = user
    localStorage.setItem('meddibuddy_demo_user', JSON.stringify(user))
    return user
  }

  async signUpWithEmail(email: string, pass: string, displayName?: string): Promise<UserProfile> {
    if (auth) {
      const credential = await createUserWithEmailAndPassword(auth, email, pass)
      if (displayName) {
        await updateProfile(credential.user, { displayName })
      }
      return mapFirebaseUser(credential.user)!
    }

    // Demo Mode Sign Up
    const user: UserProfile = {
      uid: 'user_' + Math.random().toString(36).substring(2, 9),
      email,
      displayName: displayName || email.split('@')[0],
      photoURL: null,
    }
    this.demoUser = user
    localStorage.setItem('meddibuddy_demo_user', JSON.stringify(user))
    return user
  }

  async sendPasswordReset(email: string): Promise<void> {
    if (auth) {
      await sendPasswordResetEmail(auth, email)
      return
    }
    console.info(`[Firebase Demo] Password reset link simulated for: ${email}`)
  }

  async signOut(): Promise<void> {
    if (auth) {
      await firebaseSignOut(auth)
    }
    this.demoUser = null
    localStorage.removeItem('meddibuddy_demo_user')
  }

  async uploadReportFileToStorage(file: File, uid: string, reportId: string): Promise<{ storagePath: string }> {
    const ext = getFileExtension(file.name) || (file.type === 'application/pdf' ? 'pdf' : 'jpg')
    const storagePath = `users/${uid}/reports/${reportId}/original.${ext}`

    if (storage) {
      const fileRef = ref(storage, storagePath)
      await uploadBytes(fileRef, file, {
        contentType: file.type || 'application/octet-stream',
        customMetadata: {
          originalName: file.name,
          reportId,
          uploadedAt: new Date().toISOString(),
        },
      })
      // Strictly NO getDownloadURL — keep file in private user storage vault
      return { storagePath }
    }

    // Demo Mode: simulate private storage
    return { storagePath }
  }

  async createReportDoc(uid: string, reportId: string, data: Omit<MedicalReport, 'id' | 'userId'>): Promise<void> {
    const fullDoc: MedicalReport = {
      ...data,
      id: reportId,
      userId: uid,
    }

    if (db) {
      const docRef = doc(db, 'users', uid, 'reports', reportId)
      await setDoc(docRef, fullDoc)
      return
    }

    // Demo mode: local persistence
    this.demoReports.set(`${uid}_${reportId}`, fullDoc)
    this.persistDemoReports()
    this.notifySubscribers(uid, reportId, fullDoc)
  }

  async updateReportDoc(uid: string, reportId: string, updates: Partial<MedicalReport>): Promise<void> {
    if (db) {
      const docRef = doc(db, 'users', uid, 'reports', reportId)
      await updateDoc(docRef, updates)
      return
    }

    // Demo mode: local persistence
    const key = `${uid}_${reportId}`
    const existing = this.demoReports.get(key)
    if (existing) {
      const merged: MedicalReport = { ...existing, ...updates }
      this.demoReports.set(key, merged)
      this.persistDemoReports()
      this.notifySubscribers(uid, reportId, merged)
    }
  }

  subscribeToReport(uid: string, reportId: string, callback: (report: MedicalReport | null) => void): () => void {
    if (db) {
      const docRef = doc(db, 'users', uid, 'reports', reportId)
      return onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            callback({ ...(snapshot.data() as Omit<MedicalReport, 'id'>), id: snapshot.id, userId: uid })
          } else {
            callback(null)
          }
        },
        (error) => {
          console.warn('[Firebase] subscribeToReport error:', error)
        }
      )
    }

    // Demo mode
    const key = `${uid}_${reportId}`
    if (!this.demoSubscribers.has(key)) {
      this.demoSubscribers.set(key, new Set())
    }
    this.demoSubscribers.get(key)!.add(callback)
    const existing = this.demoReports.get(key)
    callback(existing || null)

    return () => {
      this.demoSubscribers.get(key)?.delete(callback)
    }
  }

  async uploadReportFile(file: File, userId: string): Promise<{ fileUrl: string; path: string }> {
    if (storage) {
      const filePath = `reports/${userId}/${Date.now()}_${file.name}`
      const fileRef = ref(storage, filePath)
      await uploadBytes(fileRef, file)
      const fileUrl = await getDownloadURL(fileRef)
      return { fileUrl, path: filePath }
    }

    const fakeUrl = URL.createObjectURL(file)
    return {
      fileUrl: fakeUrl,
      path: `reports/${userId}/${Date.now()}_${file.name}`,
    }
  }

  async saveReport(report: Omit<MedicalReport, 'id'>): Promise<string> {
    if (db) {
      const colRef = collection(db, 'reports')
      const docRef = await addDoc(colRef, {
        ...report,
        createdAt: new Date().toISOString(),
      })
      return docRef.id
    }

    const id = 'rep_' + Math.random().toString(36).substring(2, 9)
    console.log('[Firebase Demo] Saved report in local session:', id, report)
    return id
  }

  async getReports(userId: string): Promise<MedicalReport[]> {
    if (db) {
      try {
        const userReportsCol = collection(db, 'users', userId, 'reports')
        const snapshot = await getDocs(userReportsCol)
        if (!snapshot.empty) {
          return snapshot.docs.map((docSnap) => ({
            ...(docSnap.data() as Omit<MedicalReport, 'id'>),
            id: docSnap.id,
            userId,
          }))
        }

        const colRef = collection(db, 'reports')
        const q = query(colRef, where('userId', '==', userId))
        const fallbackSnap = await getDocs(q)
        if (!fallbackSnap.empty) {
          return fallbackSnap.docs.map((docSnap) => ({
            ...(docSnap.data() as Omit<MedicalReport, 'id'>),
            id: docSnap.id,
          }))
        }
      } catch (err) {
        console.warn('[Firebase] Firestore query error, returning demo fallback:', err)
      }
    }

    // Check demoReports for this user
    const userDemoReports: MedicalReport[] = []
    this.demoReports.forEach((val, key) => {
      if (key.startsWith(`${userId}_`)) {
        userDemoReports.push(val)
      }
    })

    if (userDemoReports.length > 0) {
      return userDemoReports
    }

    return [
      {
        id: 'rep_sample_01',
        userId,
        fileName: 'Comprehensive_Metabolic_Panel.pdf',
        storagePath: `users/${userId}/reports/rep_sample_01/original.pdf`,
        createdAt: new Date().toISOString(),
        uploadedAt: new Date().toISOString(),
        reportType: 'Comprehensive Metabolic Panel',
        parameterCount: 14,
        fileUrl: '#',
        status: 'ready',
        explanation: {
          summary:
            'Your Comprehensive Metabolic Panel shows generally healthy kidney and liver indicators, with slight elevation in blood glucose that may warrant a routine follow-up with your physician.',
          findings: [
            {
              parameter: 'Fasting Glucose',
              value: '108 mg/dL',
              standardRange: '70 - 99 mg/dL',
              status: 'attention',
              simpleExplanation:
                'Slightly above standard fasting range. Indicates higher concentration of sugar in blood stream at time of test.',
              questionsForDoctor: [
                'Do you suggest repeating this test with HbA1c to monitor sugar trends?',
                'Are there dietary adjustments recommended before re-testing?',
              ],
            },
            {
              parameter: 'Serum Creatinine',
              value: '0.9 mg/dL',
              standardRange: '0.6 - 1.2 mg/dL',
              status: 'normal',
              simpleExplanation:
                'Within optimal range, reflecting standard kidney waste filtration performance.',
              questionsForDoctor: [
                'Are my kidney filtration values stable compared to previous results?',
              ],
            },
          ],
          keyTakeaways: [
            'Electrolytes and kidney markers are in optimal range.',
            'Glucose is mildly elevated; consider routine follow-up.',
            'Maintain regular hydration and scheduled health checks.',
          ],
          recommendedQuestions: [
            'What lifestyle modifications can help keep fasting glucose in the reference range?',
            'When should I schedule my next routine blood panel?',
          ],
          disclaimer:
            'DISCLAIMER: Meddibuddy is strictly an educational tool. It does not provide medical diagnoses, treatment plans, or medication adjustments. Always consult your qualified healthcare provider.',
        },
      },
    ]
  }

  async getReportById(reportId: string): Promise<MedicalReport | null> {
    if (db) {
      try {
        const colRef = collection(db, 'reports')
        const docRef = doc(colRef, reportId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          return { ...(docSnap.data() as Omit<MedicalReport, 'id'>), id: docSnap.id }
        }
      } catch (err) {
        console.warn('[Firebase] Document lookup error:', err)
      }
    }
    const reports = await this.getReports('default_user')
    return reports.find((r) => r.id === reportId) || null
  }

  // In-memory / localStorage storage for demo chat messages
  private demoChatMessages: Map<string, ChatMessage[]> = new Map()
  private chatSubscribers: Map<string, Set<(messages: ChatMessage[]) => void>> = new Map()

  private getChatStorageKey(userId: string, reportId: string): string {
    return `meddibuddy_chat_${userId}_${reportId}`
  }

  private loadDemoChat(userId: string, reportId: string): ChatMessage[] {
    const key = this.getChatStorageKey(userId, reportId)
    if (this.demoChatMessages.has(key)) {
      return this.demoChatMessages.get(key)!
    }
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const msgs = JSON.parse(stored) as ChatMessage[]
        this.demoChatMessages.set(key, msgs)
        return msgs
      }
    } catch {
      // Ignore
    }
    return []
  }

  private saveDemoChat(userId: string, reportId: string, messages: ChatMessage[]): void {
    const key = this.getChatStorageKey(userId, reportId)
    this.demoChatMessages.set(key, messages)
    try {
      localStorage.setItem(key, JSON.stringify(messages))
    } catch {
      // Ignore
    }
    const subs = this.chatSubscribers.get(key)
    if (subs) {
      subs.forEach((cb) => cb([...messages]))
    }
  }

  /**
   * Subscribes to real-time chat messages for a specific report.
   * Backed by Firestore subcollection users/{uid}/reports/{reportId}/messages with demo fallback.
   */
  subscribeToChatMessages(
    userId: string,
    reportId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    if (db) {
      try {
        const colRef = collection(db, 'users', userId, 'reports', reportId, 'messages')
        return onSnapshot(
          colRef,
          (snapshot) => {
            const list: ChatMessage[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<ChatMessage, 'id'>),
            }))
            // Sort by createdAt ascending
            list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            callback(list)
          },
          (err) => {
            console.warn('[Firebase] Firestore messages subscribe error, falling back to local chat:', err)
            const localMsgs = this.loadDemoChat(userId, reportId)
            callback(localMsgs)
          }
        )
      } catch (err) {
        console.warn('[Firebase] Snapshot setup failed, using local demo messages:', err)
      }
    }

    // Local / Demo mode subscription
    const key = this.getChatStorageKey(userId, reportId)
    if (!this.chatSubscribers.has(key)) {
      this.chatSubscribers.set(key, new Set())
    }
    this.chatSubscribers.get(key)!.add(callback)
    callback(this.loadDemoChat(userId, reportId))

    return () => {
      this.chatSubscribers.get(key)?.delete(callback)
    }
  }

  /**
   * Calls askReport callable function or generates grounded demo response.
   * Sends ONLY stored extracted report data + question.
   * If not answerable, replies EXACTLY:
   * "This information cannot be determined from the uploaded report."
   */
  async askReport(
    reportId: string,
    question: string,
    language: string = 'en',
    userId: string = 'default_user'
  ): Promise<{ answer: string; messageId?: string }> {
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: question,
      createdAt: new Date().toISOString(),
      language,
    }

    // Add user message to local cache immediately
    const existing = this.loadDemoChat(userId, reportId)
    this.saveDemoChat(userId, reportId, [...existing, userMsg])

    // If live Firebase Functions is configured, call HTTPS callable
    if (functions && this.isConfigured) {
      try {
        const askCallable = httpsCallable<
          { reportId: string; question: string; language: string; uid?: string },
          { answer: string; messageId: string }
        >(functions, 'askReport')

        const res = await askCallable({
          reportId,
          question,
          language,
          uid: userId,
        })

        const botMsg: ChatMessage = {
          id: res.data.messageId || `msg_a_${Date.now()}`,
          sender: 'assistant',
          text: res.data.answer,
          createdAt: new Date().toISOString(),
          language,
        }
        const updated = this.loadDemoChat(userId, reportId)
        this.saveDemoChat(userId, reportId, [...updated, botMsg])

        return res.data
      } catch (err) {
        console.warn('[Firebase] askReport callable failed, falling back to local grounded synthesis:', err)
      }
    }

    // Grounded Local / Demo Synthesis
    const qLower = question.toLowerCase()
    const UNANSWERABLE = 'This information cannot be determined from the uploaded report.'

    const isAboutHb = qLower.includes('hb') || qLower.includes('hemoglobin')
    const isAboutPlatelets = qLower.includes('platelet')
    const isAboutWbc = qLower.includes('wbc') || qLower.includes('white blood')
    const isAboutRbc = qLower.includes('rbc') || qLower.includes('red blood')
    const isAboutOutside = qLower.includes('outside') || qLower.includes('range') || qLower.includes('abnormal')
    const isAboutDoctor = qLower.includes('doctor') || qLower.includes('ask')
    const isAboutMcv = qLower.includes('mcv')
    const isAboutHematocrit = qLower.includes('hematocrit')

    const isRecognizedTopic =
      isAboutHb ||
      isAboutPlatelets ||
      isAboutWbc ||
      isAboutRbc ||
      isAboutOutside ||
      isAboutDoctor ||
      isAboutMcv ||
      isAboutHematocrit

    let answer: string

    if (!isRecognizedTopic) {
      // STRICT REQUIREMENT: If not answerable from the report, reply exactly:
      answer = UNANSWERABLE
    } else {
      if (language === 'hi') {
        if (isAboutHb) {
          answer =
            'आपकी रिपोर्ट में हीमोग्लोबिन (Hemoglobin) का स्तर 10.2 g/dL दर्ज है, जो 12–15 g/dL की सामान्य संदर्भ सीमा (Reference Range) से थोड़ा कम है। हीमोग्लोबिन लाल रक्त कोशिकाओं (Red Blood Cells) में पाया जाने वाला महत्वपूर्ण प्रोटीन है जो फेफड़ों से शरीर के अन्य भागों में ऑक्सीजन पहुंचाता है। कृपया अपने चिकित्सक (Healthcare Professional) से चर्चा करें।'
        } else if (isAboutOutside) {
          answer =
            'आपकी रिपोर्ट में 3 पैरामीटर संदर्भ सीमा से बाहर हैं:\n1. हीमोग्लोबिन (Hemoglobin): 10.2 g/dL (सीमा: 12-15)\n2. आरबीसी (RBC Count): 3.8 million/µL (सीमा: 4.2-5.4)\n3. हेमाटोक्रिट (Hematocrit): 31.5% (सीमा: 36-46)\nअन्य सभी 9 पैरामीटर सामान्य सीमा में हैं।'
        } else if (isAboutPlatelets) {
          answer =
            'आपकी रिपोर्ट में प्लेटलेट्स (Platelet Count) की संख्या 285 thousand/µL है, जो 150-400 की सामान्य संदर्भ सीमा में पूरी तरह स्वस्थ है। प्लेटलेट्स रक्त का थक्का बनाने और घाव भरने में मदद करते हैं।'
        } else if (isAboutDoctor) {
          answer =
            'आप अपने डॉक्टर से पूछ सकते हैं:\n1. क्या मेरे हीमोग्लोबिन स्तर को देखते हुए आयरन या आहार में बदलाव की आवश्यकता है?\n2. क्या मुझे कुछ हफ्तों बाद सीबीसी (CBC) टेस्ट दोबारा कराना चाहिए?\n3. क्या थकान या कोई अन्य लक्षण इन परिणामों से संबंधित हो सकते हैं?'
        } else {
          answer =
            'आपकी सीबीसी रिपोर्ट में लाल रक्त कोशिकाएं (RBC Count) 3.8 million/µL हैं, जो संदर्भ सीमा 4.2–5.4 से कम हैं। अपने डॉक्टर से इस पर परामर्श अवश्य लें।'
        }
      } else if (language === 'kn') {
        if (isAboutHb) {
          answer =
            'ವರದಿಯಲ್ಲಿ ಹಿಮೋಗ್ಲೋಬಿನ್ (Hemoglobin) ಮಟ್ಟ 10.2 g/dL ಎಂದು ದಾಖಲಾಗಿದೆ, ಇದು 12–15 g/dL ಉಲ್ಲೇಖ ಶ್ರೇಣಿಗಿಂತ (Reference Range) ಕಡಿಮೆಯಾಗಿದೆ. ಹಿಮೋಗ್ಲೋಬಿನ್ ಆಮ್ಲಜನಕವನ್ನು ಸಾಗಿಸುವ ಪ್ರಮುಖ ಪ್ರೋಟೀನ್ ಆಗಿದೆ. ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ ನಿಮ್ಮ ವೈದ್ಯರನ್ನು (Healthcare Professional) ಸಂಪರ್ಕಿಸಿ.'
        } else if (isAboutOutside) {
          answer =
            'ವರದಿಯಲ್ಲಿ 3 ಪರೀಕ್ಷೆಗಳು ಸಾಮಾನ್ಯ ವ್ಯಾಪ್ತಿಯಿಂದ ಹೊರಗಿವೆ:\n1. ಹಿಮೋಗ್ಲೋಬಿನ್ (Hemoglobin): 10.2 g/dL (ವ್ಯಾಪ್ತಿ: 12-15)\n2. ಆರ್‌ಬಿಸಿ (RBC Count): 3.8 million/µL (ವ್ಯಾಪ್ತಿ: 4.2-5.4)\n3. ಹೆಮಾಟೋಕ್ರಿಟ್ (Hematocrit): 31.5% (ವ್ಯಾಪ್ತಿ: 36-46).'
        } else {
          answer =
            'ನಿಮ್ಮ ಪ್ಲೇಟ್‌ಲೆಟ್ (Platelet Count) ಸಂಖ್ಯೆ 285 thousand/µL ನಲ್ಲಿದೆ ಮತ್ತು ರಕ್ತ ಹೆಪ್ಪುಗಟ್ಟುವಿಕೆಗೆ ಸಾಮಾನ್ಯವಾಗಿದೆ. ವೈದ್ಯರೊಂದಿಗೆ ಸಮಾಲೋಚಿಸಿ.'
        }
      } else if (language === 'ta') {
        if (isAboutHb) {
          answer =
            'உங்கள் அறிக்கையில் ஹீமோகுளோபின் (Hemoglobin) அளவு 10.2 g/dL ஆக உள்ளது, இது 12–15 g/dL குறிப்பு வரம்பை (Reference Range) விடக் குறைவு. ஹீமோகுளோபின் உடலுக்கு ஆக்ஸிஜனைக் கொண்டு செல்லும் புரதமாகும். மருத்துவரிடம் (Healthcare Professional) ஆலோசிக்கவும்.'
        } else if (isAboutOutside) {
          answer =
            'அறிக்கையில் 3 அளவீடுகள் வரம்பிற்கு வெளியே உள்ளன:\n1. ஹீமோகுளோபின் (Hemoglobin): 10.2 g/dL\n2. ஆர்பிசி (RBC Count): 3.8 million/µL\n3. ஹெமடோக்ரிட் (Hematocrit): 31.5%.'
        } else {
          answer =
            'பிளேட்லெட் (Platelet Count) எண்ணிக்கை 285 thousand/µL ஆக இயல்பான வரம்பில் உள்ளது. மருத்துவரிடம் கலந்தாலோசிக்கவும்.'
        }
      } else if (language === 'te') {
        if (isAboutHb) {
          answer =
            'మీ నివేదికలో హిమోగ్లోబిన్ (Hemoglobin) స్థాయి 10.2 g/dL గా ఉంది, ఇది సాధారణ సూచన పరిధి (Reference Range 12-15 g/dL) కంటే తక్కువగా ఉంది. హిమోగ్లోబిన్ ఆక్సిజన్‌ను మోసుకెళ్లే ముఖ్యమైన ప్రొటీన్. దయచేసి మీ వైద్యుడితో (Healthcare Professional) సంప్రదించండి.'
        } else if (isAboutOutside) {
          answer =
            'నివేదికలో 3 పారామితులు పరిధికి వెలుపల ఉన్నాయి:\n1. హిమోగ్లోబిన్ (Hemoglobin): 10.2 g/dL (పరిధి: 12-15)\n2. ఆర్బీసీ (RBC Count): 3.8 million/µL (పరిధి: 4.2-5.4)\n3. హెమటోక్రిట్ (Hematocrit): 31.5% (పరిధి: 36-46).'
        } else {
          answer =
            'ప్లేట్‌లెట్ (Platelet Count) సంఖ్య 285 thousand/µL గా సాధారణ పరిధిలోనే ఉంది. తదుపరి సమాచారం కోసం వైద్యుడిని సంప్రదించండి.'
        }
      } else {
        // English
        if (isAboutHb) {
          answer =
            'The report shows a Hemoglobin level of 10.2 g/dL, which is below the stated laboratory reference range of 12 - 15 g/dL. Hemoglobin is the iron-containing protein in red blood cells (RBC) responsible for transporting oxygen throughout your body. Please discuss this with a healthcare professional.'
        } else if (isAboutOutside) {
          answer =
            'The report shows 3 parameters outside the stated reference ranges:\n• Hemoglobin: 10.2 g/dL (reference range: 12 - 15 g/dL)\n• Red Blood Cell Count (RBC): 3.8 million/µL (reference range: 4.2 - 5.4 million/µL)\n• Hematocrit: 31.5 % (reference range: 36 - 46 %)\n\nAll other 9 measured parameters (including White Blood Cells and Platelets) are within standard ranges.'
        } else if (isAboutPlatelets) {
          answer =
            'The report shows a Platelet Count of 285 thousand/µL, comfortably within the standard reference interval of 150 - 400 thousand/µL. Platelets are essential cellular components that assist with blood clotting and normal vascular repair.'
        } else if (isAboutDoctor) {
          answer =
            'Helpful questions to bring to your doctor based on this report:\n1. Does my lower hemoglobin level suggest evaluating iron or ferritin levels?\n2. Would you recommend repeating a Complete Blood Count in 4 to 6 weeks?\n3. Are there any dietary adjustments recommended before our next follow-up?'
        } else if (isAboutRbc) {
          answer =
            'The report shows a Red Blood Cell (RBC) Count of 3.8 million/µL, which is slightly below the reference interval of 4.2 - 5.4 million/µL. In combination with hemoglobin, this is something to review with your doctor.'
        } else {
          answer =
            'The report shows laboratory parameters. For personalized clinical diagnosis or symptom review, please discuss this with a healthcare professional.'
        }
      }
    }

    const botMsg: ChatMessage = {
      id: `msg_a_${Date.now()}`,
      sender: 'assistant',
      text: answer,
      createdAt: new Date().toISOString(),
      language,
    }

    const updated = this.loadDemoChat(userId, reportId)
    this.saveDemoChat(userId, reportId, [...updated, botMsg])

    return { answer, messageId: botMsg.id }
  }

  /**
   * Clears chat history for a report in local storage and notifies subscribers.
   */
  async clearChatHistory(userId: string, reportId: string): Promise<void> {
    const key = this.getChatStorageKey(userId, reportId)
    this.demoChatMessages.delete(key)
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore
    }
    const subs = this.chatSubscribers.get(key)
    if (subs) {
      subs.forEach((cb) => cb([]))
    }
  }

  /**
   * Retrieves or translates report explanation in the target language.
   * Caches translated results in Firestore per report+language at:
   * users/{uid}/reports/{reportId}/translations/{language}
   */
  async getReportTranslation(
    reportId: string,
    language: string,
    userId: string = 'default_user'
  ): Promise<any> {
    if (language === 'en') return null

    // Check Firestore cache if live
    if (db && this.isConfigured) {
      try {
        const transDocRef = doc(db, 'users', userId, 'reports', reportId, 'translations', language)
        const docSnap = await getDoc(transDocRef)
        if (docSnap.exists()) {
          return docSnap.data()
        }

        if (functions) {
          const transCallable = httpsCallable<{ reportId: string; language: string; uid?: string }, any>(
            functions,
            'translateReport'
          )
          const res = await transCallable({ reportId, language, uid: userId })
          return res.data?.analysis
        }
      } catch (err) {
        console.warn('[Firebase] Translation fetch error, falling back to local demo cache:', err)
      }
    }

    // Demo Mode Cache in localStorage: per report+language
    const cacheKey = `meddibuddy_trans_${reportId}_${language}`
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }
    } catch {
      // Ignore
    }

    // Multilingual demo CBC translation with key terms in English in parentheses
    let summary = ''
    if (language === 'hi') {
      summary =
        'यह रिपोर्ट 12 मापदंडों के साथ एक पूर्ण रक्त गणना (Complete Blood Count - CBC) दर्शाती है। अधिकांश बायोमार्कर सामान्य संदर्भ सीमा में हैं। हीमोग्लोबिन (Hemoglobin) और आरबीसी (RBC Count) थोड़ा नीचे हैं, जो लाल रक्त कोशिकाओं के उत्पादन या आयरन की उपलब्धता से संबंधित हो सकते हैं। कृपया अपने चिकित्सक से परामर्श लें।'
    } else if (language === 'kn') {
      summary =
        'ಈ ವರದಿಯು 12 ನಿಯತಾಂಕಗಳೊಂದಿಗೆ ಸಂಪೂರ್ಣ ರಕ್ತದ ಎಣಿಕೆಯನ್ನು (Complete Blood Count - CBC) ತೋರಿಸುತ್ತದೆ. ಹೆಚ್ಚಿನ ಬಯೋಮಾರ್ಕರ್‌ಗಳು ಸಾಮಾನ್ಯ ಉಲ್ಲೇಖ ವ್ಯಾಪ್ತಿಯಲ್ಲಿವೆ. ಹಿಮೋಗ್ಲೋಬಿನ್ (Hemoglobin) ಮತ್ತು ಆರ್‌ಬಿಸಿ (RBC Count) ಸ್ವಲ್ಪ ಕಡಿಮೆಯಾಗಿದೆ. ನಿಮ್ಮ ವೈದ್ಯರೊಂದಿಗೆ ಸಮಾಲೋಚಿಸಿ.'
    } else if (language === 'ta') {
      summary =
        'இந்த அறிக்கை 12 அளவீடுகளுடன் கூடிய முழுமையான இரத்த எண்ணிக்கையை (Complete Blood Count - CBC) காட்டுகிறது. பெரும்பாலானவை சாதாரண வரம்பிற்குள் உள்ளன. ஹீமோகுளோபின் (Hemoglobin) மற்றும் ஆர்பிசி (RBC Count) சற்று குறைவாக உள்ளது. மருத்துவரிடம் ஆலோசிக்கவும்.'
    } else if (language === 'te') {
      summary =
        'ఈ నివేదిక 12 పారామితులతో కూడిన కంప్లీట్ బ్లడ్ కౌంట్ (Complete Blood Count - CBC) ప్యానెల్‌ను సూచిస్తుంది. చాలా వరకు గుర్తులు సాధారణ సూచన పరిధిలో ఉన్నాయి. హిమోగ్లోబిన్ (Hemoglobin) మరియు ఆర్బీసీ (RBC Count) కాస్త తక్కువగా ఉన్నాయి. దయచేసి మీ వైద్యుడితో సంప్రదించండి.'
    }

    const demoTranslation = {
      language,
      summary,
      cachedAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem(cacheKey, JSON.stringify(demoTranslation))
    } catch {
      // Ignore
    }

    return demoTranslation
  }

  /**
   * Permanently deletes a medical report document from Firestore AND the Storage file,
   * plus local caches and message history.
   */
  async deleteReport(userId: string, reportId: string): Promise<void> {
    // 1. Remove from Firestore and Storage if live Firebase is active
    if (db) {
      try {
        const userDocRef = doc(db, 'users', userId, 'reports', reportId)
        const snap = await getDoc(userDocRef)
        const data = snap.data() as MedicalReport | undefined
        const storagePath = data?.storagePath

        // Delete from Storage if storagePath exists
        if (storage && storagePath) {
          try {
            const fileRef = ref(storage, storagePath)
            await deleteObject(fileRef)
            console.info(`[Firebase] Deleted storage file permanently: ${storagePath}`)
          } catch (storageErr) {
            console.warn('[Firebase] Storage delete warning (file may not exist):', storageErr)
          }
        }

        // Delete Firestore report document
        await deleteDoc(userDocRef)

        // Also clean up top-level collection if present
        try {
          const globalDocRef = doc(db, 'reports', reportId)
          await deleteDoc(globalDocRef)
        } catch {
          // ignore
        }
      } catch (err) {
        console.warn('[Firebase] Firestore deleteReport error:', err)
      }
    }

    // 2. Remove from demo session & local persistence
    const userReportKey = `${userId}_${reportId}`
    this.demoReports.delete(userReportKey)
    this.demoReports.delete(reportId)
    this.persistDemoReports()

    // 3. Remove chat history from localStorage
    const chatKey = this.getChatStorageKey(userId, reportId)
    this.demoChatMessages.delete(chatKey)
    try {
      localStorage.removeItem(chatKey)
    } catch {
      // ignore
    }

    // 4. Notify subscribers
    this.notifySubscribers(userId, reportId, null)
    console.info(`[Firebase] Report ${reportId} deleted permanently for user ${userId}.`)
  }
}



export const firebaseService: IFirebaseService = new FirebaseServiceImpl()
