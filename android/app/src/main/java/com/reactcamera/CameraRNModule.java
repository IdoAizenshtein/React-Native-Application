package com.reactcamera;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;

public class CameraRNModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private static final String TAG = "CameraRNModule";

    public CameraRNModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "CameraXViewRN";
    }

//    @ReactMethod
//    public void takePicture(Promise promise) {
//        try {
//            Integer eventId = 3333;
//            MainView.instance.takePicture();
//            MainView.instance.takePictureCb(WritableMap pictureWasTakenConfig){
//
//            }
//            promise.resolve();
//        } catch(Exception e) {
//            promise.reject("Create Event Error", e);
//        }
//    }

    @ReactMethod
    public void takePicture(Callback errorCallback, Callback successCallback) {
        try {
            MainView view = MainView.getInstance();
            view.takePicture(successCallback, errorCallback);
        } catch (Exception e) {
        }
    }
    @ReactMethod
    public void startCamera(Callback errorCallback, Callback successCallback) {
        try {
            MainView view = MainView.getInstance();
        } catch (Exception e) {
        }
    }
}
