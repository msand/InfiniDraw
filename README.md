[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/msand/InfiniDraw)

# [InfiniDraw](https://infinidraw.live)
Universal svg drawing with pan and zoom. Builds on [Next.js](https://github.com/zeit/next.js/) and [react-native-web](https://github.com/necolas/react-native-web) for the web version, and [react-native](https://github.com/facebook/react-native/) for native apps.
Uses [react-native-svg](https://github.com/react-native-community/react-native-svg/) on native, [svgs](https://github.com/godaddy/svgs) for the web, and [zoomable-svg](https://github.com/msand/zoomable-svg) in both. Kudos to all the makers involved.

## Try it

[Web version](https://infinidraw.live)

[Snack version](https://snack.expo.io/@msand/infinidraw)

[Expo version](https://expo.io/@msand/InfiniDrawExpo) ([source code](https://github.com/msand/InfiniDrawExpo/))

[Android Play store](https://play.google.com/store/apps/details?id=com.infinidraw)

## How to use

### Install dependencies
- [Node.js](https://nodejs.org/)
- [react-native](https://facebook.github.io/react-native/docs/getting-started.html)

### Install InfiniDraw

Clone the repo

```bash
git clone https://github.com/msand/InfiniDraw.git
cd InfiniDraw
```

Install it:
```bash
npm install
```

### Run web

```bash
npm run dev
```

### Deploy web version to the cloud with [now](https://zeit.co/now) ([download](https://zeit.co/download))

```bash
now
```

### Run native ios version

```bash
npm run ios
```
or
```bash
npm run native
react-native run-ios
```

### Run native ios release version

[Build native version for production](https://facebook.github.io/react-native/docs/running-on-device.html#building-your-app-for-production)

```bash
npm run native
react-native run-ios --configuration Release
```

### Run native android version

```bash
npm run android
```
or
```bash
npm run native
react-native run-android
```

### Run native android release version

[Sign Android app](https://facebook.github.io/react-native/docs/signed-apk-android.html)

```bash
npm run native
react-native run-android --variant=release
```

## The idea behind the example

This example features how to use [react-native-web](https://github.com/necolas/react-native-web) and [zoomable-svg](https://github.com/msand/zoomable-svg) to bring the platform-agnostic Components and APIs of React Native to the web with pan-and-zoom svg drawing.

> **High-quality user interfaces**: React Native for Web makes it easy to create fast, adaptive web UIs in JavaScript. It provides native-like interactions, support for multiple input modes (touch, mouse, keyboard), optimized vendor-prefixed styles, built-in support for RTL layout, built-in accessibility, and integrates with React Dev Tools.
>
> **Write once, render anywhere**: React Native for Web interoperates with existing React DOM components and is compatible with the majority of the React Native API. You can develop new components for native and web without rewriting existing code. React Native for Web can also render to HTML and critical CSS on the server using Node.js.

## Privacy policy

No meta-data is collected from using this app. Only the time, color and shape of the strokes drawn are stored in the database.
