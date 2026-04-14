# تشغيل التطبيق على Android - دليل الإعداد المحلي

## المتطلبات الأساسية

قبل البدء، تأكد من تثبيت المتطلبات التالية على جهازك:

### 1. Node.js و npm/pnpm
```bash
# تحقق من إصدار Node.js
node --version  # يجب أن يكون v18 أو أحدث

# تحقق من pnpm
pnpm --version  # يجب أن يكون v9 أو أحدث
```

**إذا لم تكن مثبتة:**
- قم بتنزيل Node.js من: https://nodejs.org/
- قم بتثبيت pnpm: `npm install -g pnpm`

### 2. Expo CLI
```bash
# تثبيت Expo CLI عالمياً
npm install -g expo-cli
# أو
pnpm add -g expo-cli

# تحقق من التثبيت
expo --version
```

### 3. Android Studio و Android SDK
- قم بتنزيل Android Studio من: https://developer.android.com/studio
- قم بتثبيت Android SDK (يتم تثبيته افتراضياً مع Android Studio)
- قم بتثبيت Android Emulator

### 4. Java Development Kit (JDK)
```bash
# تحقق من تثبيت Java
java -version  # يجب أن يكون JDK 11 أو أحدث

# إذا لم يكن مثبتاً، قم بتنزيله من:
# https://www.oracle.com/java/technologies/downloads/
```

---

## خطوات الإعداد

### الخطوة 1: استنساخ المشروع
```bash
# انسخ المشروع إلى جهازك
git clone <repository-url>
cd car_wash_inventory
```

### الخطوة 2: تثبيت الاعتماديات
```bash
# قم بتثبيت جميع الحزم المطلوبة
pnpm install

# تحقق من التثبيت
pnpm check
```

### الخطوة 3: إعداد متغيرات البيئة
```bash
# إنشء ملف .env (إذا لم يكن موجوداً)
# أضف المتغيرات المطلوبة:
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_APP_NAME=Car Wash Inventory
```

### الخطوة 4: تشغيل Android Emulator
```bash
# افتح Android Studio
# ثم انقر على: Tools > Device Manager > Create Device

# أو استخدم سطر الأوامر:
emulator -avd <device_name>

# قائمة الأجهزة المتاحة:
emulator -list-avds
```

---

## تشغيل التطبيق

### الطريقة 1: استخدام Expo Go (الأسهل)

```bash
# ابدأ خادم Expo
pnpm dev

# سيظهر رمز QR في الطرفية
# افتح تطبيق Expo Go على هاتفك الذكي
# امسح رمز QR لتحميل التطبيق
```

**مميزات Expo Go:**
- ✅ لا تحتاج إلى بناء APK
- ✅ تحديثات فورية (Hot Reload)
- ✅ اختبار سريع

### الطريقة 2: استخدام Android Emulator

```bash
# تأكد من تشغيل Android Emulator أولاً
emulator -avd <device_name>

# ثم قم بتشغيل التطبيق
pnpm android

# أو
expo start --android
```

### الطريقة 3: بناء APK للاختبار

```bash
# بناء APK للاختبار (development)
eas build --platform android --profile preview

# أو بناء APK للإنتاج
eas build --platform android --profile production

# ستحصل على رابط تنزيل APK
```

---

## استكشاف الأخطاء

### المشكلة: 'expo' is not recognized

**الحل:**
```bash
# تأكد من تثبيت Expo CLI عالمياً
npm install -g expo-cli

# أو استخدم npx
npx expo start --android
```

### المشكلة: Android Emulator لا يعمل

**الحل:**
```bash
# تحقق من قائمة الأجهزة
emulator -list-avds

# إعادة تشغيل ADB
adb kill-server
adb start-server

# بدء محاكي جديد
emulator -avd <device_name>
```

### المشكلة: خطأ في البناء

**الحل:**
```bash
# نظف ذاكرة التخزين المؤقتة
pnpm install --force

# أعد بناء المشروع
pnpm check

# جرب مرة أخرى
pnpm android
```

### المشكلة: المنفذ 8081 مشغول

**الحل:**
```bash
# استخدم منفذ مختلف
EXPO_PORT=8082 pnpm dev

# أو أغلق العملية المستخدمة للمنفذ
# على Windows:
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

---

## أوامر مفيدة

```bash
# تشغيل التطبيق
pnpm dev              # تطوير عام
pnpm android          # تشغيل على Android Emulator
pnpm ios              # تشغيل على iOS Simulator (Mac فقط)

# الاختبار والتحقق
pnpm test             # تشغيل الاختبارات
pnpm check            # التحقق من TypeScript
pnpm lint             # التحقق من الأسلوب

# البناء والنشر
pnpm build            # بناء الخادم
pnpm start            # تشغيل الخادم

# تنظيف
pnpm install --force  # إعادة تثبيت الاعتماديات
rm -rf node_modules   # حذف المجلد (Windows: rmdir /s node_modules)
```

---

## نصائح للتطوير

### 1. استخدم Expo Go للاختبار السريع
```bash
pnpm dev
# امسح رمز QR بهاتفك
```

### 2. استخدم Android Emulator للاختبار الشامل
```bash
pnpm android
```

### 3. استخدم React Native Debugger
```bash
# تنزيل من: https://github.com/jhen0409/react-native-debugger
# ثم افتحه وشغل التطبيق
```

### 4. تفعيل Hot Reload
- اضغط `r` في الطرفية لإعادة تحميل الشاشة
- اضغط `w` لفتح قائمة الويب

---

## المتطلبات الدنيا للجهاز

| المتطلب | الحد الأدنى | الموصى به |
|--------|-----------|----------|
| **RAM** | 4GB | 8GB+ |
| **Disk Space** | 10GB | 20GB+ |
| **Node.js** | v16 | v18+ |
| **Android SDK** | API 21 | API 31+ |
| **Java** | JDK 11 | JDK 17+ |

---

## الخطوات التالية

بعد تشغيل التطبيق بنجاح:

1. **اختبر الميزات الأساسية:**
   - تسجيل الدخول
   - إدارة المخزون
   - عرض التقارير
   - المحادثات والملاحظات

2. **اختبر على أجهزة مختلفة:**
   - أجهزة بأحجام شاشات مختلفة
   - إصدارات Android مختلفة

3. **اختبر الأداء:**
   - استخدم React Native Debugger
   - راقب استهلاك الذاكرة
   - اختبر مع بيانات كثيرة

---

## الدعم والمساعدة

إذا واجهت مشاكل:

1. **تحقق من السجلات:**
   ```bash
   # عرض السجلات في الطرفية
   # اضغط `l` لفتح سجل الأخطاء
   ```

2. **ابحث عن الحل:**
   - https://docs.expo.dev/
   - https://reactnative.dev/
   - https://stackoverflow.com/

3. **اطلب المساعدة:**
   - اتصل بفريق التطوير
   - أرسل رسالة خطأ مفصلة

---

**ملاحظة:** هذا الدليل مخصص للتطوير المحلي. للنشر على متجر Google Play، اتبع خطوات إضافية في `DEPLOYMENT.md`.
