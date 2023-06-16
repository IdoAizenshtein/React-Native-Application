# React Native App
 
<p align="center">
  <img src="apple-icon.png" height="50">
  <img src="588-5882846_ios-app-transparent-ios-logo-png-png-download.png" height="50">
  <img src="Android_logo_2019_(stacked).svg.png" height="50">
  <img src="logo (1).png" height="50">
  <img src="swift-96x96_2x.png" height="50">
  <img src="objective-c.png" height="50">
  <img src="React.svg.png" height="50">
  <img src="Java_programming_language_logo.svg.png" height="50">
</p>

### Debug

```
react-native run-android --variant=prodDebug
or
react-native run-android --variant=devDebug
```

`— variant=<productFlavour><BuildType>`

If you get error like a:

```
Error type 3
Error: Activity class {com.mmm/com.busdue.MainActivity} does not exist.
```

ii not a problem, just run the application manually in simulator/device.

### Building APK

From root directory of project run following commands:

```
cd android && ./gradlew assembleDevRelease
or
cd android && ./gradlew assembleProdRelease
or
cd android && ./gradlew assembleRelease
```

`assemble<ProductFlavour><BuildType>`
