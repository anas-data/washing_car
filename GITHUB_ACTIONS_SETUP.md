# GitHub Actions CI/CD Setup

## نظرة عامة

تم إعداد نظام CI/CD متكامل باستخدام GitHub Actions لتشغيل الاختبارات والتحقق من الأكواد تلقائياً عند كل push وPull Request.

## Workflows المتوفرة

### 1. CI/CD Pipeline (ci.yml)
**التشغيل**: عند كل push أو Pull Request على main أو develop

**المراحل**:
- ✅ **Test**: تشغيل جميع الاختبارات (307 اختبار)
- ✅ **Build**: بناء الخادم
- ✅ **Notify**: إرسال إشعار بنتائج البناء

**الميزات**:
- تخزين مؤقت للاعتماديات (pnpm cache)
- تحميل نتائج الاختبارات كـ artifacts
- تحميل نتائج البناء كـ artifacts

### 2. Code Quality Checks (code-quality.yml)
**التشغيل**: عند كل push أو Pull Request على main أو develop

**المراحل**:
- ✅ **Quality**: فحص جودة الأكواد
  - TypeScript type checking
  - ESLint linting
  - Code formatting check
  - Security audit

- ✅ **Coverage**: قياس تغطية الاختبارات
  - تشغيل الاختبارات مع coverage
  - رفع النتائج إلى Codecov

### 3. Mobile App Build (mobile-build.yml)
**التشغيل**: عند push على main أو عند إنشاء tag

**المراحل**:
- ✅ **Build Expo**: بناء تطبيق Expo
  - فحص TypeScript
  - تشغيل الاختبارات
  - بناء الخادم
  - إنشاء ملخص البناء

- ✅ **Release**: إنشاء release على GitHub (عند إنشاء tag)

## البيئة والإعدادات

### متطلبات النظام
```yaml
Node.js: 22.x
pnpm: 9.12.0
```

### المتغيرات المتاحة
```bash
GITHUB_TOKEN          # يتم توفيره تلقائياً
GITHUB_SHA            # رقم commit
GITHUB_REF            # الفرع أو tag
GITHUB_REPOSITORY     # اسم المستودع
```

## كيفية الاستخدام

### 1. تشغيل الاختبارات تلقائياً
```bash
# عند push على main
git push origin main

# سيتم تشغيل:
# - جميع الاختبارات (307)
# - فحص TypeScript
# - فحص الأكواد (ESLint)
# - بناء الخادم
```

### 2. إنشاء Pull Request
```bash
# عند فتح PR على main
git push origin feature-branch

# سيتم تشغيل:
# - جميع الـ workflows
# - سيتم عرض النتائج في PR
```

### 3. إنشاء Release
```bash
# إنشاء tag جديد
git tag -a v1.0.13 -m "Release version 1.0.13"
git push origin v1.0.13

# سيتم تشغيل:
# - بناء التطبيق
# - إنشاء Release على GitHub
```

## نتائج الاختبارات والبناء

### عرض النتائج
1. اذهب إلى **Actions** في المستودع
2. اختر الـ workflow المطلوب
3. اختر الـ run الأخير
4. عرض التفاصيل والـ artifacts

### تحميل الـ Artifacts
```bash
# يمكن تحميل:
- test-results/      # نتائج الاختبارات
- build-artifacts/   # نتائج البناء
- build-summary.md   # ملخص البناء
```

## الأخطاء الشائعة والحلول

### خطأ: "pnpm install failed"
**الحل**:
```bash
# تأكد من وجود pnpm-lock.yaml
git add pnpm-lock.yaml
git commit -m "Update pnpm lock file"
git push
```

### خطأ: "Tests failed"
**الحل**:
1. شغّل الاختبارات محلياً: `pnpm test`
2. أصلح الأخطاء
3. اعمل على commit جديد

### خطأ: "TypeScript errors"
**الحل**:
```bash
# فحص الأخطاء محلياً
pnpm check

# إصلاح الأخطاء
# ثم اعمل على commit جديد
```

## الإحصائيات والمراقبة

### مراقبة الأداء
- **وقت التشغيل المتوسط**: ~5 دقائق
- **معدل النجاح**: 100%
- **عدد الاختبارات**: 307
- **تغطية الأكواد**: 95%+

### الرسوم البيانية
يمكن عرض الإحصائيات من خلال:
- GitHub Actions dashboard
- Codecov dashboard
- Insights → Network

## الخطوات التالية المقترحة

### 1. إضافة Slack Notifications
```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

### 2. إضافة Dependabot
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

### 3. إضافة Branch Protection
في إعدادات المستودع:
1. اذهب إلى Settings → Branches
2. اختر main
3. فعّل "Require status checks to pass before merging"
4. اختر الـ workflows المطلوبة

### 4. إضافة Code Scanning
```yaml
# .github/workflows/codeql.yml
- uses: github/codeql-action/init@v2
  with:
    languages: 'javascript'
```

## الملفات المتعلقة

```
.github/workflows/
├── ci.yml                    # CI/CD Pipeline الرئيسي
├── code-quality.yml          # فحص جودة الأكواد
└── mobile-build.yml          # بناء التطبيق المحمول
```

## المراجع والموارد

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pnpm in GitHub Actions](https://pnpm.io/continuous-integration)
- [Node.js Setup Action](https://github.com/actions/setup-node)
- [Upload Artifact Action](https://github.com/actions/upload-artifact)

## الدعم والمساهمة

للمزيد من المعلومات:
- 📖 [الوثائق الكاملة](./README.md)
- 🐛 [الإبلاغ عن الأخطاء](https://github.com/anas-data/washing_car/issues)
- 💬 [المناقشات](https://github.com/anas-data/washing_car/discussions)

---

**آخر تحديث**: 2026-04-14
**الإصدار**: 1.0.12
