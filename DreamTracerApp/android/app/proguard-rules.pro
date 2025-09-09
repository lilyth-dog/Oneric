# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native 최적화
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.yoga.** { *; }

# Hermes 최적화
-keep class com.facebook.hermes.** { *; }

# Firebase 최적화
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# 네이티브 모듈 최적화
-keep class com.reactnativecommunity.** { *; }
-keep class com.swmansion.** { *; }

# 불필요한 코드 제거
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

# 최적화 설정
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification
-dontpreverify

# 번들 크기 최적화
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile