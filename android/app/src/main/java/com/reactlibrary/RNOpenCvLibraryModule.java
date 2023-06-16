package com.reactlibrary;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import android.view.Surface;


import android.os.Bundle;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.io.ByteArrayOutputStream;

import android.util.Base64;

import org.opencv.android.Utils;

import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.MatOfInt;
import org.opencv.core.MatOfPoint;
import org.opencv.core.MatOfPoint2f;
import org.opencv.core.Point;
import org.opencv.imgcodecs.*;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.core.Size;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.opencv.calib3d.Calib3d;
import org.opencv.core.MatOfByte;

import android.util.Log;


// import java.io.File;
// import java.util.ArrayList;
// import java.util.Arrays;
// import java.util.Collections;
import java.util.Comparator;
// import java.util.Date;
// import java.util.HashMap;
import java.util.List;
//
// import android.provider.MediaStore;
// import android.content.Context;
// import android.content.SharedPreferences;
// import android.os.Handler;
// import android.os.Looper;
// import android.os.Message;
// import android.preference.PreferenceManager;
// import android.view.Surface;
// import android.os.Bundle;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import com.reactlibrary.Quadrilateral;
import com.reactlibrary.CapturedImage;


import android.content.Context;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.preference.PreferenceManager;
import android.util.Log;


import android.view.Surface;

import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.MatOfPoint;
import org.opencv.core.MatOfPoint2f;
import org.opencv.core.Point;
import org.opencv.core.Size;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;

import android.hardware.Camera;


public class RNOpenCvLibraryModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private Quadrilateral lastDetectedRectangle = null;
    private static final String TAG = "RNOpenCvLibraryModule";
    public final static String BASE64_PREFIX = "data:image/";
    final static int FIXED_HEIGHT = 800;
    private final static double COLOR_GAIN = 1.5;       // contrast
    private final static double COLOR_BIAS = 0;         // bright
    private final static int COLOR_THRESH = 110;        // threshold


    public RNOpenCvLibraryModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNOpenCvLibrary";
    }

    private Mat fourPointTransform(Mat src, Point[] pts) {
        Point tl = pts[0];
        Point tr = pts[1];
        Point br = pts[2];
        Point bl = pts[3];

        double widthA = Math.sqrt(Math.pow(br.x - bl.x, 2) + Math.pow(br.y - bl.y, 2));
        double widthB = Math.sqrt(Math.pow(tr.x - tl.x, 2) + Math.pow(tr.y - tl.y, 2));

        double dw = Math.max(widthA, widthB);
        int maxWidth = Double.valueOf(dw).intValue();

        double heightA = Math.sqrt(Math.pow(tr.x - br.x, 2) + Math.pow(tr.y - br.y, 2));
        double heightB = Math.sqrt(Math.pow(tl.x - bl.x, 2) + Math.pow(tl.y - bl.y, 2));

        double dh = Math.max(heightA, heightB);
        int maxHeight = Double.valueOf(dh).intValue();

        Mat doc = new Mat(maxHeight, maxWidth, CvType.CV_8UC4);

        Mat src_mat = new Mat(4, 1, CvType.CV_32FC2);
        Mat dst_mat = new Mat(4, 1, CvType.CV_32FC2);

        src_mat.put(0, 0, tl.x, tl.y, tr.x, tr.y, br.x, br.y,
                bl.x, bl.y);
        dst_mat.put(0, 0, 0.0, 0.0, dw, 0.0, dw, dh, 0.0, dh);

        Mat m = Imgproc.getPerspectiveTransform(src_mat, dst_mat);

        Imgproc.warpPerspective(src, doc, m, doc.size());

        return doc;
    }

    public static double getScaleRatio(Size srcSize) {
        return srcSize.height / FIXED_HEIGHT;
    }

    public static List<MatOfPoint> findContours(Mat src) {
        try {
            Mat img = src.clone();

            //find contours
            double ratio = getScaleRatio(img.size());
            int width = (int) (img.size().width / ratio);
            int height = (int) (img.size().height / ratio);
            Size newSize = new Size(width, height);
            Mat resizedImg = new Mat(newSize, CvType.CV_8UC4);
            Imgproc.resize(img, resizedImg, newSize);
            img.release();

            Imgproc.medianBlur(resizedImg, resizedImg, 7);

            Mat cannedImg = new Mat(newSize, CvType.CV_8UC1);
            Imgproc.Canny(resizedImg, cannedImg, 70, 200, 3, true);
//            Imgproc.Canny(resizedImg, cannedImg, 80, 100, 3, false);
            resizedImg.release();

            Imgproc.threshold(cannedImg, cannedImg, 70, 255, Imgproc.THRESH_OTSU);

            Mat dilatedImg = new Mat(newSize, CvType.CV_8UC1);
            Mat morph = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, new Size(3, 3));
            Imgproc.dilate(cannedImg, dilatedImg, morph, new Point(-1, -1), 2, 1, new Scalar(1));
            cannedImg.release();
            morph.release();

            ArrayList<MatOfPoint> contours = new ArrayList<>();
            Mat hierarchy = new Mat();
            Imgproc.findContours(dilatedImg, contours, hierarchy, Imgproc.RETR_TREE, Imgproc.CHAIN_APPROX_SIMPLE);//Imgproc.RETR_EXTERNAL
            hierarchy.release();
            dilatedImg.release();

            Log.i(TAG, "contours found: " + contours.size());

            Collections.sort(contours, new Comparator<MatOfPoint>() {
                @Override
                public int compare(MatOfPoint o1, MatOfPoint o2) {
                    return Double.valueOf(Imgproc.contourArea(o2)).compareTo(Imgproc.contourArea(o1));
                }
            });

            return contours;
        } catch (Exception e) {
            ArrayList<MatOfPoint> contours = new ArrayList<>();
            Log.i("99999", String.valueOf(e.getMessage()));
            return contours;
        }
    }

//     private ArrayList<MatOfPoint> findContours(Mat src) {
//         try {
//             Mat grayImage;
//             Mat cannedImage;
//             Mat resizedImage;
//
//             int height = Double.valueOf(src.size().height).intValue();
//             int width = Double.valueOf(src.size().width).intValue();
//             Size size = new Size(width, height);
//
//             resizedImage = new Mat(size, CvType.CV_8UC4);
//             grayImage = new Mat(size, CvType.CV_8UC4);
//             cannedImage = new Mat(size, CvType.CV_8UC1);
//
//             Imgproc.resize(src, resizedImage, size);
//             Imgproc.cvtColor(resizedImage, grayImage, Imgproc.COLOR_RGBA2GRAY, 4);
//             Imgproc.GaussianBlur(grayImage, grayImage, new Size(5, 5), 0);
//             Imgproc.Canny(grayImage, cannedImage, 80, 100, 3, false);
//
//             ArrayList<MatOfPoint> contours = new ArrayList<>();
//             Mat hierarchy = new Mat();
//
//             Imgproc.findContours(cannedImage, contours, hierarchy, Imgproc.RETR_TREE, Imgproc.CHAIN_APPROX_SIMPLE);
//
//             hierarchy.release();
//
//             Collections.sort(contours, new Comparator<MatOfPoint>() {
//
//                 @Override
//                 public int compare(MatOfPoint lhs, MatOfPoint rhs) {
//                     return Double.compare(Imgproc.contourArea(rhs), Imgproc.contourArea(lhs));
//                 }
//             });
//
//             resizedImage.release();
//             grayImage.release();
//             cannedImage.release();
//
//             return contours;
//
// //            Mat grayImage;
// //            Mat cannedImage;
// //            Mat resizedImage;
// //
// //            int height = Double.valueOf(src.size().height).intValue();
// //            int width = Double.valueOf(src.size().width).intValue();
// //            Size size = new Size(width, height);
// //            resizedImage = new Mat(size, CvType.CV_8UC4);
// //            grayImage = new Mat(size, CvType.CV_8UC4);
// //            cannedImage = new Mat(size, CvType.CV_8UC1);
// //            Imgproc.resize(src, resizedImage, size);
// //
// //
// //
// //            Imgproc.cvtColor(resizedImage, grayImage, Imgproc.COLOR_RGB2HSV, 4);
// //            List<Mat> image = new ArrayList<>(3);
// //            Core.split(grayImage, image);
// //            Mat saturationChannel = image.get(1);
// //            Imgproc.GaussianBlur(saturationChannel, grayImage, new Size(5, 5), 0);
// //            Imgproc.threshold(grayImage, grayImage, 127, 255, Imgproc.THRESH_BINARY_INV | Imgproc.THRESH_OTSU);
// //            Imgproc.Canny(grayImage, cannedImage, 80, 100, 3, false);
// //
// //
// //            ArrayList<MatOfPoint> contours = new ArrayList<>();
// //            Mat hierarchy = new Mat();
// //            Imgproc.findContours(cannedImage, contours, hierarchy, Imgproc.RETR_TREE, Imgproc.CHAIN_APPROX_SIMPLE);
// //            hierarchy.release();
// //            Collections.sort(contours, new Comparator<MatOfPoint>() {
// //                @Override
// //                public int compare(MatOfPoint lhs, MatOfPoint rhs) {
// //                    return Double.compare(Imgproc.contourArea(rhs), Imgproc.contourArea(lhs));
// //                }
// //            });
// //
// //            resizedImage.release();
// //            grayImage.release();
// //            cannedImage.release();
// //
// //            return contours;
//
//
//         } catch (Exception e) {
//             ArrayList<MatOfPoint> contours = new ArrayList<>();
//             Log.i("99999", String.valueOf(e.getMessage()));
//             return contours;
//         }
//     }

    private Quadrilateral getQuadrilateral(List<MatOfPoint> contours, Size srcSize) {
        double ratio = getScaleRatio(srcSize);
        int height = Double.valueOf(srcSize.height / ratio).intValue();
        int width = Double.valueOf(srcSize.width / ratio).intValue();
        Size size = new Size(width, height);

        for (MatOfPoint c : contours) {
            MatOfPoint2f c2f = new MatOfPoint2f(c.toArray());
            double peri = Imgproc.arcLength(c2f, true);
            MatOfPoint2f approx = new MatOfPoint2f();
            Imgproc.approxPolyDP(c2f, approx, 0.02 * peri, true);

            Point[] points = approx.toArray();
            Log.i("SCANNER", "approx size: " + points.length);

            // select biggest 4 angles polygon
            if (points.length == 4) {
                Point[] foundPoints = sortPoints(points);

                if (isInside(foundPoints, size) && isLargeEnough(foundPoints, size, 0.25)) {
                    return new Quadrilateral(c, getUpscaledPoints(foundPoints, getScaleRatio(srcSize)), new Size(srcSize.width, srcSize.height));
                } else {
                    //showToast(context, "Try getting closer to the ID");
                    Log.i("SCANNER", "Not inside defined area");
                }
            }
        }


        //showToast(context, "Make sure the ID is on a contrasting background");
        return null;
    }

    //     private Quadrilateral getQuadrilateral(ArrayList<MatOfPoint> contours, Size srcSize) {
//
//         int height = Double.valueOf(srcSize.height).intValue();
//         int width = Double.valueOf(srcSize.width).intValue();
//         Size size = new Size(width, height);
//
//         Log.i(TAG, "Size----->" + size);
//         for (MatOfPoint c : contours) {
//             MatOfPoint2f c2f = new MatOfPoint2f(c.toArray());
//             double peri = Imgproc.arcLength(c2f, true);
//             MatOfPoint2f approx = new MatOfPoint2f();
//             Imgproc.approxPolyDP(c2f, approx, 0.02 * peri, true);
//
//             Point[] points = approx.toArray();
//
//             // select biggest 4 angles polygon
//             Point[] foundPoints = sortPoints(points);
//             if (insideArea(foundPoints, size)) {
//                 return new Quadrilateral(c, foundPoints, new Size(srcSize.width, srcSize.height));
//             }
//         }
//
//         return null;
//     }
    private Point[] getUpscaledPoints(Point[] points, double scaleFactor) {
        Point[] rescaledPoints = new Point[4];

        for (int i = 0; i < 4; i++) {
            int x = Double.valueOf(points[i].x * scaleFactor).intValue();
            int y = Double.valueOf(points[i].y * scaleFactor).intValue();
            rescaledPoints[i] = new Point(x, y);
        }

        return rescaledPoints;
    }

    private boolean isLargeEnough(Point[] points, Size size, double ratio) {
        double contentWidth = Math.max(new Line(points[0], points[1]).length(), new Line(points[3], points[2]).length());
        double contentHeight = Math.max(new Line(points[0], points[3]).length(), new Line(points[1], points[2]).length());

        double widthRatio = contentWidth / size.width;
        double heightRatio = contentHeight / size.height;

        Log.i(TAG, "ratio: wr-" + widthRatio + ", hr-" + heightRatio + ", w: " + size.width + ", h: " + size.height + ", cw: " + contentWidth + ", ch: " + contentHeight);

        return widthRatio >= ratio && heightRatio >= ratio;
    }

    private boolean isInside(Point[] points, Size size) {
        int width = Double.valueOf(size.width).intValue();
        int height = Double.valueOf(size.height).intValue();

        boolean isInside = points[0].x >= 0 && points[0].y >= 0
                && points[1].x <= width && points[1].y >= 0
                && points[2].x <= width && points[2].y <= height
                && points[3].x >= 0 && points[3].y <= height;

        Log.i(TAG, "w: " + width + ", h: " + height + "\nPoints: " + points[0] + ", " + points[1] + ", " + points[2] + ", " + points[3] + ", result: " + isInside);
        return isInside;
    }

    private boolean insideArea(Point[] rp, Size size) {
        int width = Double.valueOf(size.width).intValue();
        int height = Double.valueOf(size.height).intValue();

        int minimumSize = width / 10;

        boolean isANormalShape = rp[0].x != rp[1].x && rp[1].y != rp[0].y && rp[2].y != rp[3].y && rp[3].x != rp[2].x;
        boolean isBigEnough = ((rp[1].x - rp[0].x >= minimumSize) && (rp[2].x - rp[3].x >= minimumSize)
                && (rp[3].y - rp[0].y >= minimumSize) && (rp[2].y - rp[1].y >= minimumSize));

        double leftOffset = rp[0].x - rp[3].x;
        double rightOffset = rp[1].x - rp[2].x;
        double bottomOffset = rp[0].y - rp[1].y;
        double topOffset = rp[2].y - rp[3].y;

        boolean isAnActualRectangle = ((leftOffset <= minimumSize && leftOffset >= -minimumSize)
                && (rightOffset <= minimumSize && rightOffset >= -minimumSize)
                && (bottomOffset <= minimumSize && bottomOffset >= -minimumSize)
                && (topOffset <= minimumSize && topOffset >= -minimumSize));

        return isANormalShape && isAnActualRectangle && isBigEnough;
    }


//     private Point[] sortPoints(Point[] src) {
//
//         ArrayList<Point> srcPoints = new ArrayList<>(Arrays.asList(src));
//
//         Point[] result = {null, null, null, null};
//
//         Comparator<Point> sumComparator = new Comparator<Point>() {
//             @Override
//             public int compare(Point lhs, Point rhs) {
//                 return Double.compare(lhs.y + lhs.x, rhs.y + rhs.x);
//             }
//         };
//
//         Comparator<Point> diffComparator = new Comparator<Point>() {
//
//             @Override
//             public int compare(Point lhs, Point rhs) {
//                 return Double.compare(lhs.y - lhs.x, rhs.y - rhs.x);
//             }
//         };
//
//         // top-left corner = minimal sum
//         result[0] = Collections.min(srcPoints, sumComparator);
//
//         // bottom-right corner = maximal sum
//         result[2] = Collections.max(srcPoints, sumComparator);
//
//         // top-right corner = minimal difference
//         result[1] = Collections.min(srcPoints, diffComparator);
//
//         // bottom-left corner = maximal difference
//         result[3] = Collections.max(srcPoints, diffComparator);
//
//         return result;
//     }

    private Point[] sortPoints(Point[] src) {

        ArrayList<Point> srcPoints = new ArrayList<>(Arrays.asList(src));

        Point[] result = {null, null, null, null};

        Comparator<Point> sumComparator = new Comparator<Point>() {
            @Override
            public int compare(Point lhs, Point rhs) {
                return Double.valueOf(lhs.y + lhs.x).compareTo(rhs.y + rhs.x);
            }
        };

        Comparator<Point> diffComparator = new Comparator<Point>() {

            @Override
            public int compare(Point lhs, Point rhs) {
                return Double.valueOf(lhs.y - lhs.x).compareTo(rhs.y - rhs.x);
            }
        };

        // top-left corner = minimal sum
        result[0] = Collections.min(srcPoints, sumComparator);

        // bottom-right corner = maximal sum
        result[2] = Collections.max(srcPoints, sumComparator);

        // top-right corner = minimal diference
        result[1] = Collections.min(srcPoints, diffComparator);

        // bottom-left corner = maximal difference
        result[3] = Collections.max(srcPoints, diffComparator);

        return result;
    }

    /**
     * Loads the bitmap resource from a base64 encoded jpg or png.
     * Format is as such:
     * png: 'data:image/png;base64,iVBORw0KGgoAA...'
     * jpg: 'data:image/jpeg;base64,/9j/4AAQSkZJ...'
     */
    private Bitmap loadBitmapFromBase64(String imagePath) {
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inDither = true;
        options.inPreferredConfig = Bitmap.Config.ARGB_8888;
        final byte[] decodedString = Base64.decode(imagePath, Base64.DEFAULT);
        return BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
    }

    /**
     * Crops the image to the latest detected rectangle and fixes perspective
     */
    private CapturedImage cropImageToLatestQuadrilateral(Mat capturedImage) {
        Mat croppedCapturedImage = this.lastDetectedRectangle.cropImageToRectangleSize(capturedImage);
        Mat doc = fourPointTransform(croppedCapturedImage, this.lastDetectedRectangle.getPointsForSize(croppedCapturedImage.size()));
        croppedCapturedImage.release();

//        Core.flip(doc.t(), doc, 0);
//        Core.flip(capturedImage.t(), capturedImage, 0);
        CapturedImage sd = new CapturedImage(capturedImage);

        sd.originalSize = capturedImage.size();
        sd.heightWithRatio = Double.valueOf(sd.originalSize.width).intValue();
        sd.widthWithRatio = Double.valueOf(sd.originalSize.height).intValue();
        return sd.setProcessed(doc);
    }

    /**
     * Detects a rectangle from the image and sets the last detected rectangle
     */
    @ReactMethod
    public void detectRectangle(String imageAsBase64, Callback errorCallback, Callback successCallback) {
        try {

            String baseSrc = imageAsBase64.replace("file://", "");
//            Log.i("baseSrc", baseSrc);

//            File toStream = new File(replaceString);
//            if (!toStream.canRead()) {
//                Log.i("cant read-----!!!", "'false'");
//            }
//
//            if (!toStream.isFile()) {
//                Log.i("uploadFile", "Source File not exist :" + imageAsBase64);
//            } else {
//                Log.i("uploadFile", "file exist");
//            }
            Mat mat = Imgcodecs.imread(baseSrc, Imgcodecs.CV_LOAD_IMAGE_UNCHANGED);
//            if (mat.empty()) {
//                Log.i("imageAsBase64-----", String.valueOf(mat.size()));
//            }


//             byte[] dataByte = Base64.decode(imageAsBase64, Base64.DEFAULT);
//             Mat mat = Imgcodecs.imdecode(new MatOfByte(dataByte), Imgcodecs.IMREAD_UNCHANGED);


            Size srcSize = mat.size();
            List<MatOfPoint> contours = findContours(mat);
            Log.i("contours", String.valueOf(contours));
            mat.release();
            Bundle data = new Bundle();


            if (!contours.isEmpty()) {
                Log.i("contoursNotisEmpty", "'contoursNotisEmpty'");

                this.lastDetectedRectangle = getQuadrilateral(contours, srcSize);
                Log.i("lastDetectedRectangle",  String.valueOf(this.lastDetectedRectangle.points));

                if (this.lastDetectedRectangle != null) {
                    Bundle quadMap = this.lastDetectedRectangle.toBundle();
                    data.putBundle("detectedRectangle", quadMap);
                } else {
                    data.putBoolean("detectedRectangle", false);
                }
            } else {
                Log.i("contoursisEmpty", "'empty'");
                data.putBoolean("detectedRectangle", false);
            }
            successCallback.invoke(Arguments.fromBundle(data));


//             ArrayList<MatOfPoint> contours = findContours(mat);
//             Size srcSize = mat.size();
//             this.lastDetectedRectangle = getQuadrilateral(contours, srcSize);
//             Bundle data = new Bundle();
//             if (this.lastDetectedRectangle != null) {
//                 Bundle quadMap = this.lastDetectedRectangle.toBundle();
//                 data.putBundle("detectedRectangle", quadMap);
//             } else {
//                 data.putBoolean("detectedRectangle", false);
//             }
//             successCallback.invoke(Arguments.fromBundle(data));
        } catch (Exception e) {
            errorCallback.invoke(e.getMessage());
        }
    }

    @ReactMethod
    public void cropAndPerspectiveTransformCorrection(String imageAsBase64, ReadableMap points, Callback errorCallback, Callback successCallback) {
        try {
//            Mat docBase = new Mat();
//            Bitmap bitmapBase = decodeSampledBitmapFromUri(imageAsBase64, reqWidth, reqHeight);
//            Utils.matToBitmap(docBase, bitmapBase);
//             byte[] dataByte = Base64.decode(imageAsBase64, Base64.DEFAULT);
//             Mat imageMat = Imgcodecs.imdecode(new MatOfByte(dataByte), Imgcodecs.IMREAD_UNCHANGED);

            String baseSrc = imageAsBase64.replace("file://", "");
            Mat imageMat = Imgcodecs.imread(baseSrc, Imgcodecs.CV_LOAD_IMAGE_UNCHANGED);
            Size srcSize = imageMat.size();
            Log.i(TAG, "cropAndPerspectiveTransformCorrection");

            Point tl = new Point(points.getMap("topLeft").getDouble("x"), points.getMap("topLeft").getDouble("y"));
            Point tr = new Point(points.getMap("topRight").getDouble("x"), points.getMap("topRight").getDouble("y"));
            Point bl = new Point(points.getMap("bottomLeft").getDouble("x"), points.getMap("bottomLeft").getDouble("y"));
            Point br = new Point(points.getMap("bottomRight").getDouble("x"), points.getMap("bottomRight").getDouble("y"));

            Point[] selectedPoints = {tl, tr, bl, br};
            Log.i(TAG, "selectedPoints - imported image " + tl.toString());
            Log.i(TAG, "selectedPoints - imported image " + tr.toString());
            Log.i(TAG, "selectedPoints - imported image " + bl.toString());
            Log.i(TAG, "selectedPoints - imported image " + br.toString());
            Point[] foundPoints = sortPoints(selectedPoints);

            this.lastDetectedRectangle = new Quadrilateral(null, foundPoints, new Size(srcSize.width, srcSize.height));

            Log.i(TAG, "processCapturedImage - imported image " + imageMat.size().width + "x" + imageMat.size().height);

//            CapturedImage cap = cropImageToLatestQuadrilateral(imageMat);

            Mat croppedCapturedImage = this.lastDetectedRectangle.cropImageToRectangleSize(imageMat);
            Mat doc = fourPointTransform(croppedCapturedImage, this.lastDetectedRectangle.getPointsForSize(croppedCapturedImage.size()));
            croppedCapturedImage.release();


            MatOfByte mob = new MatOfByte();
            Imgcodecs.imencode(".jpg", doc, mob);
            byte[] byteArray = mob.toArray();


//            Imgproc.cvtColor(doc, doc, Imgproc.COLOR_RGBA2GRAY);
//            doc.convertTo(doc, CvType.CV_8UC1, 1, 10);


//            Mat doc = cap.getProcessed();
//            Bitmap bitmap = Bitmap.createBitmap(doc.cols(), doc.rows(), Bitmap.Config.ARGB_8888);
//            Utils.matToBitmap(doc, bitmap);
//
//            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
//            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, byteArrayOutputStream);
//            byte[] byteArray = byteArrayOutputStream.toByteArray();

            String base64Str = Base64.encodeToString(byteArray, Base64.DEFAULT);
            WritableMap params = Arguments.createMap();
            params.putString("newImage", base64Str);
            successCallback.invoke(params);
            imageMat.release();
            doc.release();
        } catch (Exception e) {
            errorCallback.invoke(e.getMessage());
        }
    }


    public Bitmap decodeSampledBitmapFromUri(String path, int reqWidth, int reqHeight) {

        Bitmap bm = null;
        // First decode with inJustDecodeBounds=true to check dimensions
        final BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        byte[] decodedString = Base64.decode(path, Base64.DEFAULT);
        BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length, options);

        // Calculate inSampleSize
        options.inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight);

//        options.inDither = true;
//        options.inPreferredConfig = Bitmap.Config.ARGB_8888;

        // Decode bitmap with inSampleSize set
        options.inJustDecodeBounds = false;
        final byte[] decodedString2 = Base64.decode(path, Base64.DEFAULT);
        bm = BitmapFactory.decodeByteArray(decodedString2, 0, decodedString2.length, options);
        return bm;
    }

//    public int calculateInSampleSize(
//            BitmapFactory.Options options, int reqWidth, int reqHeight) {
//
//        // Raw height and width of image
//        final int height = options.outHeight;
//        final int width = options.outWidth;
//        int inSampleSize = 1;
//
//        if (height > reqHeight || width > reqWidth) {
//            if (width > height) {
//                inSampleSize = Math.round((float)height / (float)reqHeight);
//            } else {
//                inSampleSize = Math.round((float)width / (float)reqWidth);
//            }
//        }
//
//        return inSampleSize;
//    }

    public int calculateInSampleSize(
            BitmapFactory.Options options, int reqWidth, int reqHeight) {
        // Raw height and width of image
        final int height = options.outHeight;
        final int width = options.outWidth;
        int inSampleSize = 1;

        if (height > reqHeight || width > reqWidth) {

            final int halfHeight = height / 2;
            final int halfWidth = width / 2;

            // Calculate the largest inSampleSize value that is a power of 2 and keeps both
            // height and width larger than the requested height and width.
            while ((halfHeight / inSampleSize) >= reqHeight
                    && (halfWidth / inSampleSize) >= reqWidth) {
                inSampleSize *= 2;
            }
        }

        return inSampleSize;
    }
}
