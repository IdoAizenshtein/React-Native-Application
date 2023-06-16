import React, {Fragment, PureComponent} from 'react';
import {withTranslation} from 'react-i18next';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {Circle, Polygon, Rect} from 'react-native-svg';
import OpenCV from 'src/NativeModules/OpenCV';
import CustomIcon from '../../../../components/Icons/Fontello';
import {HeaderHeightContext} from '@react-navigation/elements';

import {IS_IOS} from '../../../../constants/common';
import {sp} from '../../../../utils/func';
import {fonts} from '../../../../styles/vars';
import FastImage from 'react-native-fast-image';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

const s = props =>
  StyleSheet.create({
    handlerI: {
      borderRadius: 0,
      height: 10,
      width: 10,
      backgroundColor: '#022258',
    },
    handlerRound: {
      width: 26,
      position: 'absolute',
      height: 26,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: '#038ed6',
      backgroundColor: '#ffffff',
    },
    handlerCenterRound: {
      width: 51,
      height: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#038ed6',
      backgroundColor: 'white',
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -25.5,
      marginTop: -5,
    },
    handlerCenterRound2: {
      width: 51,
      height: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: 'yellow',
      backgroundColor: 'transparent',
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -25.5,
      marginTop: -5,
    },
    handlerBox: {
      height: 150,
      width: 150,
      backgroundColor: 'blue',
      borderRadius: 5,
    },
    image: {
      width: Dimensions.get('window').width,
      position: 'absolute',
      alignSelf: 'center',
    },
    bottomButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#022258',
      borderRadius: 4,
      zIndex: 3,
      height: 40,
      width: 40,
    },
    handler: {
      height: 26,
      width: 26,
      overflow: 'visible',
      // marginLeft: -30,
      // backgroundColor: 'red',
      // marginTop: -30,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
    },
    handlerCenter: {
      height: 51,
      width: 51,
      overflow: 'visible',
      // marginLeft: -30,
      // backgroundColor: 'red',
      // marginTop: -30,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
    },
    cropContainer: {
      position: 'absolute',
      left: 0,
      width: Dimensions.get('window').width,
      top: 0,
    },
    closeCrop: {
      position: 'absolute',
      top: 20,
      right: 17.5,
      zIndex: 99,
    },
    boxTopLeft: {
      height: 15,
      width: 15,
      backgroundColor: 'blue',
      borderRadius: 7.5,
    },
    boxTopRight: {
      height: 15,
      width: 15,
      backgroundColor: 'red',
      borderRadius: 7.5,
    },
    boxBottomLeft: {
      height: 15,
      width: 15,
      backgroundColor: 'yellow',
      borderRadius: 7.5,
    },
    boxBottomRight: {
      height: 15,
      width: 15,
      backgroundColor: 'green',
      borderRadius: 7.5,
    },
    boxCenterHor: {
      height: 15,
      width: 25,
      backgroundColor: 'black',
      borderWidth: 1,
      borderColor: 'white',
      borderRadius: 7.5,
    },
    boxCenter: {
      height: 25,
      width: 15,
      backgroundColor: 'black',
      borderWidth: 1,
      borderColor: 'white',
      borderRadius: 7.5,
    },
  });

@withTranslation()
export default class Crop extends PureComponent {
  constructor(props) {
    super(props);
    this.headerHeight = 0;

    // - (isIphoneX() ? 25 : 0)
    let ratio = props.width / props.height;
    let windowHeight = Dimensions.get('window').height;
    let windowWidth = Dimensions.get('window').width;

    // let tryHeight = (windowHeight / 40) * 70
    // let tryWidth = ratio * tryHeight
    //
    // if (tryWidth > windowWidth - 80) {
    //     tryWidth = windowWidth - 80
    //     tryHeight = tryWidth / ratio
    // }

    this.viewHeight =
      Dimensions.get('window').width * (props.height / props.width);
    this.topEdge = -10;
    this.bottomEdge = this.viewHeight - 25;
    this.leftEdge = -5;
    this.rightEdge = Dimensions.get('window').width - 35;
    this.marginTopContainer = IS_IOS
      ? 0
      : this.headerHeight +
        (Dimensions.get('window').height -
          this.headerHeight -
          this.viewHeight) /
          2 -
        60;
    this.yPosCorrect = this.marginTopContainer + this.headerHeight + 25;
    console.log('yPosCorrect', this.yPosCorrect);
    // console.log(Dimensions.get('window').height, this.headerHeight, (isIphoneX() ? 25 : 0), this.viewHeight)

    const topLeftAnimate = new Animated.ValueXY({
      x: this.leftEdge + 5,
      y: this.topEdge + (IS_IOS ? 50 : 5),
    });
    const topRightAnimate = new Animated.ValueXY({
      x: this.rightEdge - 5,
      y: this.topEdge + (IS_IOS ? 50 : 5),
    });
    const bottomLeftAnimate = new Animated.ValueXY({
      x: this.leftEdge + 5,
      y: this.bottomEdge - 10,
    });
    const bottomRightAnimate = new Animated.ValueXY({
      x: this.rightEdge - 5,
      y: this.bottomEdge - 10,
    });

    const topCenterAnimate = new Animated.ValueXY(
      this.calculateSizeOfLineByTwoPoints(topLeftAnimate, topRightAnimate),
    );
    const bottomCenterAnimate = new Animated.ValueXY(
      this.calculateSizeOfLineByTwoPoints(
        bottomLeftAnimate,
        bottomRightAnimate,
      ),
    );
    const leftCenterAnimate = new Animated.ValueXY(
      this.calculateSizeOfLineByTwoPoints(topLeftAnimate, bottomLeftAnimate),
    );
    const rightCenterAnimate = new Animated.ValueXY(
      this.calculateSizeOfLineByTwoPoints(topRightAnimate, bottomRightAnimate),
    );

    const angleTop = this.calculateAngle(
      {
        x: topRightAnimate.x._value,
        y: topRightAnimate.y._value,
      },
      {
        x: topLeftAnimate.x._value,
        y: topLeftAnimate.y._value,
      },
    );
    const angleBottom = this.calculateAngle(
      {
        x: bottomRightAnimate.x._value,
        y: bottomRightAnimate.y._value,
      },
      {
        x: bottomLeftAnimate.x._value,
        y: bottomLeftAnimate.y._value,
      },
    );
    const angleRight = this.calculateAngle(
      {
        x: topRightAnimate.x._value,
        y: topRightAnimate.y._value,
      },
      {
        x: bottomRightAnimate.x._value,
        y: bottomRightAnimate.y._value,
      },
    );
    const angleLeft = this.calculateAngle(
      {
        x: topLeftAnimate.x._value,
        y: topLeftAnimate.y._value,
      },
      {
        x: bottomLeftAnimate.x._value,
        y: bottomLeftAnimate.y._value,
      },
    );

    this.state = {
      angleTop,
      angleBottom,
      angleRight,
      angleLeft,
      slide: new Animated.Value(Dimensions.get('window').height),
      detectRectangleImage: false,
      newImage: false,
      topLeft: topLeftAnimate,
      topRight: topRightAnimate,
      bottomLeft: bottomLeftAnimate,
      bottomRight: bottomRightAnimate,
      topCenter: topCenterAnimate,
      bottomCenter: bottomCenterAnimate,
      rightCenter: rightCenterAnimate,
      leftCenter: leftCenterAnimate,
      overlayPositions: `${topLeftAnimate.x._value + 20},${
        topLeftAnimate.y._value + 20
      } ${topRightAnimate.x._value + 20},${topRightAnimate.y._value + 20} ${
        bottomRightAnimate.x._value + 20
      },${bottomRightAnimate.y._value + 20} ${
        bottomLeftAnimate.x._value + 20
      },${bottomLeftAnimate.y._value + 20}`,
      viewHeight: Dimensions.get('window').width * (props.height / props.width),
      height: props.height,
      width: props.width,
      image: props.initialImage,
      initialImageBase64: props.initialImage,
      modalAlert: {
        visible: false,
        children: {
          header: null,
          body: null,
          footer: null,
        },
        styleWrap: null,
      },
    };

    this.panResponderTopLeft = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetResponderCapture: () => true, //Tell iOS that we are allowing the movement
      onMoveShouldSetPanResponderCapture: () => true, // Same here, tell iOS that we allow dragging
      onPanResponderGrant: () => {
        this.setState({
          originValues: {
            x: this.state.topLeft.x._value,
            y: this.state.topLeft.y._value,
          },
        });
        this.state.topLeft.setOffset({
          x: this.state.topLeft.x._value,
          y: this.state.topLeft.y._value,
        });
        this.state.topLeft.setValue({x: 0, y: 0});
      },
      onPanResponderMove: (event, gesture) => {
        let disableDrag = false;
        if (
          gesture.moveX < this.leftEdge + 15 ||
          gesture.moveX > this.rightEdge + 25 ||
          gesture.moveY < this.topEdge + this.yPosCorrect ||
          gesture.moveY > this.bottomEdge + this.yPosCorrect
        ) {
          disableDrag = true;
        }
        const realXPos =
          this.state.originValues.x + this.state.topLeft.x._value;
        const realYPos =
          this.state.originValues.y + this.state.topLeft.y._value;

        const rightEdge = this.state.topRight.x._value - 40;
        const bottomEdge = this.state.bottomLeft.y._value - 40;
        // if (event.nativeEvent.pageX <= 10) {
        //     disableDrag = true;
        //     console.log('edge page from Left')
        // }
        // if (110 >= event.nativeEvent.pageY) {
        //     disableDrag = true;
        //     console.log('edge page from Top')
        // }
        if (this.state.topLeft.x._value !== 0) {
          console.log('Move x', new Date().getTime());
          if (this.state.topLeft.x._value < 0) {
            console.log('Move x Left', new Date().getTime());
          } else {
            if (realXPos >= rightEdge) {
              disableDrag = true;
              console.log('This is the right edge', new Date().getTime());
            }
            console.log('Move x Right', new Date().getTime());
          }
        }
        if (this.state.topLeft.y._value !== 0) {
          console.log('Move y', new Date().getTime());
          if (this.state.topLeft.y._value < 0) {
            console.log('Move y Up', new Date().getTime());
          } else {
            if (realYPos >= bottomEdge) {
              console.log('This is the bottom edge', new Date().getTime());
              disableDrag = true;
            }
            console.log('Move y Down', new Date().getTime());
          }
        }

        const angleTop = this.calculateAngle(
          {
            x: this.state.topRight.x._value,
            y: this.state.topRight.y._value,
          },
          {
            x: realXPos,
            y: realYPos,
          },
        );
        const angleLeft = this.calculateAngle(
          {
            x: realXPos,
            y: realYPos,
          },
          {
            x: this.state.bottomLeft.x._value,
            y: this.state.bottomLeft.y._value,
          },
        );
        const overlayPositions = `${realXPos + 20},${realYPos + 20} ${
          this.state.topRight.x._value + 20
        },${this.state.topRight.y._value + 20} ${
          this.state.bottomRight.x._value + 20
        },${this.state.bottomRight.y._value + 20} ${
          this.state.bottomLeft.x._value + 20
        },${this.state.bottomLeft.y._value + 20}`;

        this.setState({
          overlayPositions,
          angleTop,
          angleLeft,
        });
        this.setState({
          showZoom: true,
          OFFSET_LEFT: realXPos,
          OFFSET_TOP: realYPos,
        });
        const topCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          {
            x: realXPos,
            y: realYPos,
          },
          this.state.topRight,
        );
        this.state.topCenter.setValue(topCenterAnimate);

        const leftCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          {
            x: realXPos,
            y: realYPos,
          },
          this.state.bottomLeft,
        );
        this.state.leftCenter.setValue(leftCenterAnimate);

        if (disableDrag) {
          return;
        }

        this.state.topLeft.setValue({x: gesture.dx, y: gesture.dy});
      },
      onPanResponderRelease: () => {
        this.state.topLeft.flattenOffset();

        // this.state.topLeft.extractOffset();
        this.updateOverlayString();
        this.setState({
          showZoom: false,
        });
      },
    });
    this.panResponderTopRight = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetResponderCapture: () => true, //Tell iOS that we are allowing the movement
      onMoveShouldSetPanResponderCapture: () => true, // Same here, tell iOS that we allow dragging
      onPanResponderGrant: () => {
        this.setState({
          originValues: {
            x: this.state.topRight.x._value,
            y: this.state.topRight.y._value,
          },
        });
        this.state.topRight.setOffset({
          x: this.state.topRight.x._value,
          y: this.state.topRight.y._value,
        });
        this.state.topRight.setValue({x: 0, y: 0});
      },
      onPanResponderMove: (event, gesture) => {
        let disableDrag = false;
        if (
          gesture.moveX < this.leftEdge + 15 ||
          gesture.moveX > this.rightEdge + 25 ||
          gesture.moveY < this.topEdge + this.yPosCorrect ||
          gesture.moveY > this.bottomEdge + this.yPosCorrect
        ) {
          disableDrag = true;
        }
        const realXPos =
          this.state.originValues.x + this.state.topRight.x._value;
        const realYPos =
          this.state.originValues.y + this.state.topRight.y._value;
        const leftEdge = this.state.topLeft.x._value + 40;
        const bottomEdge = this.state.bottomRight.y._value - 40;
        // if ((Dimensions.get('window').width - 15) <= event.nativeEvent.pageX) {
        //     disableDrag = true;
        //     console.log('edge page from Right')
        // }
        // if (110 >= event.nativeEvent.pageY) {
        //     disableDrag = true;
        //     console.log('edge page from Top')
        // }
        if (this.state.topRight.x._value !== 0) {
          console.log('Move x', new Date().getTime());
          if (this.state.topRight.x._value < 0) {
            if (realXPos <= leftEdge) {
              disableDrag = true;
              console.log('This is the left edge', new Date().getTime());
            }
            console.log('Move x Left', new Date().getTime());
          } else {
            console.log('Move x Right', new Date().getTime());
          }
        }
        if (this.state.topRight.y._value !== 0) {
          console.log('Move y', new Date().getTime());
          if (this.state.bottomRight.y._value < 0) {
            console.log('Move y Up', new Date().getTime());
          } else {
            if (realYPos >= bottomEdge) {
              console.log('This is the bottom edge', new Date().getTime());
              disableDrag = true;
            }
            console.log('Move y Down', new Date().getTime());
          }
        }

        const angleTop = this.calculateAngle(
          {
            x: realXPos,
            y: realYPos,
          },
          {
            x: this.state.topLeft.x._value,
            y: this.state.topLeft.y._value,
          },
        );
        const angleRight = this.calculateAngle(
          {
            x: realXPos,
            y: realYPos,
          },
          {
            x: this.state.bottomRight.x._value,
            y: this.state.bottomRight.y._value,
          },
        );
        const overlayPositions = `${this.state.topLeft.x._value + 20},${
          this.state.topLeft.y._value + 20
        } ${realXPos + 20},${realYPos + 20} ${
          this.state.bottomRight.x._value + 20
        },${this.state.bottomRight.y._value + 20} ${
          this.state.bottomLeft.x._value + 20
        },${this.state.bottomLeft.y._value + 20}`;
        this.setState({
          overlayPositions,
          angleTop,
          angleRight,
        });

        this.setState({
          showZoom: true,
          OFFSET_LEFT: realXPos,
          OFFSET_TOP: realYPos,
        });
        const topCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.topLeft,
          {
            x: realXPos,
            y: realYPos,
          },
        );
        this.state.topCenter.setValue(topCenterAnimate);

        const rightCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          {
            x: realXPos,
            y: realYPos,
          },
          this.state.bottomRight,
        );
        this.state.rightCenter.setValue(rightCenterAnimate);

        if (disableDrag) {
          return;
        }

        this.state.topRight.setValue({x: gesture.dx, y: gesture.dy});
      },
      onPanResponderRelease: () => {
        this.state.topRight.flattenOffset();
        // Animated.spring(this.state.topRight, {
        //   toValue: 0,
        //   useNativeDriver: true,
        //   // toValue: {
        //   //     x: 0,
        //   //     y: 0,
        //   // },
        // }).start();
        this.updateOverlayString();
        this.setState({
          showZoom: false,
        });
      },
    });
    this.panResponderBottomRight = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetResponderCapture: () => true, //Tell iOS that we are allowing the movement
      onMoveShouldSetPanResponderCapture: () => true, // Same here, tell iOS that we allow dragging
      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now

        this.setState({
          originValues: {
            x: this.state.bottomRight.x._value,
            y: this.state.bottomRight.y._value,
          },
        });
        this.state.bottomRight.setOffset({
          x: this.state.bottomRight.x._value,
          y: this.state.bottomRight.y._value,
        });
        this.state.bottomRight.setValue({x: 0, y: 0});
      },
      onPanResponderMove: (event, gesture) => {
        let disableDrag = false;
        if (
          gesture.moveX < this.leftEdge + 15 ||
          gesture.moveX > this.rightEdge + 25 ||
          gesture.moveY < this.topEdge + this.yPosCorrect ||
          gesture.moveY > this.bottomEdge + this.yPosCorrect
        ) {
          disableDrag = true;
        }
        const realXPos =
          this.state.originValues.x + this.state.bottomRight.x._value;
        const realYPos =
          this.state.originValues.y + this.state.bottomRight.y._value;
        const leftEdge = this.state.bottomLeft.x._value + 40;
        const topEdge = this.state.topRight.y._value + 40;
        // if ((Dimensions.get('window').width - 15) <= event.nativeEvent.pageX) {
        //     disableDrag = true;
        //     console.log('edge page from Right')
        // }
        // if ((Dimensions.get('window').height - 90) <= event.nativeEvent.pageY) {
        //     disableDrag = true;
        //     console.log('edge page from Bottom')
        // }
        if (this.state.bottomRight.x._value !== 0) {
          console.log('Move x', new Date().getTime());
          if (this.state.bottomRight.x._value < 0) {
            if (realXPos <= leftEdge) {
              disableDrag = true;
              console.log('This is the left edge', new Date().getTime());
            }
            console.log('Move x Left', new Date().getTime());
          } else {
            console.log('Move x Right', new Date().getTime());
          }
        }
        if (this.state.bottomRight.y._value !== 0) {
          console.log('Move y', new Date().getTime());
          if (this.state.bottomRight.y._value < 0) {
            if (realYPos <= topEdge) {
              console.log('This is the top edge', new Date().getTime());
              disableDrag = true;
            }
            console.log('Move y Up', new Date().getTime());
          } else {
            console.log('Move y Down', new Date().getTime());
          }
        }
        const angleBottom = this.calculateAngle(
          {
            x: realXPos,
            y: realYPos,
          },
          {
            x: this.state.bottomLeft.x._value,
            y: this.state.bottomLeft.y._value,
          },
        );
        const angleRight = this.calculateAngle(
          {
            x: this.state.topRight.x._value,
            y: this.state.topRight.y._value,
          },
          {
            x: realXPos,
            y: realYPos,
          },
        );

        const overlayPositions = `${this.state.topLeft.x._value + 20},${
          this.state.topLeft.y._value + 20
        } ${this.state.topRight.x._value + 20},${
          this.state.topRight.y._value + 20
        } ${realXPos + 20},${realYPos + 20} ${
          this.state.bottomLeft.x._value + 20
        },${this.state.bottomLeft.y._value + 20}`;

        this.setState({
          overlayPositions,
          angleBottom,
          angleRight,
        });
        this.setState({
          showZoom: true,
          OFFSET_LEFT: realXPos,
          OFFSET_TOP: realYPos,
        });
        const bottomCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.bottomLeft,
          {
            x: realXPos,
            y: realYPos,
          },
        );
        this.state.bottomCenter.setValue(bottomCenterAnimate);

        const rightCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.topRight,
          {
            x: realXPos,
            y: realYPos,
          },
        );
        this.state.rightCenter.setValue(rightCenterAnimate);

        if (disableDrag) {
          return;
        }

        this.state.bottomRight.setValue({x: gesture.dx, y: gesture.dy});
      },
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        this.state.bottomRight.flattenOffset();
        // Animated.spring(this.state.bottomRight, {
        //   toValue: 0,
        //   useNativeDriver: true,
        //   // toValue: {
        //   //     x: 0,
        //   //     y: 0,
        //   // },
        // }).start();
        this.updateOverlayString();
        this.setState({
          showZoom: false,
        });
      },
    });
    this.panResponderBottomLeft = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetResponderCapture: () => true, //Tell iOS that we are allowing the movement
      onMoveShouldSetPanResponderCapture: () => true, // Same here, tell iOS that we allow dragging
      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now

        this.setState({
          originValues: {
            x: this.state.bottomLeft.x._value,
            y: this.state.bottomLeft.y._value,
          },
        });
        this.state.bottomLeft.setOffset({
          x: this.state.bottomLeft.x._value,
          y: this.state.bottomLeft.y._value,
        });
        this.state.bottomLeft.setValue({x: 0, y: 0});
      },
      onPanResponderMove: (event, gesture) => {
        let disableDrag = false;
        if (
          gesture.moveX < this.leftEdge + 15 ||
          gesture.moveX > this.rightEdge + 25 ||
          gesture.moveY < this.topEdge + this.yPosCorrect ||
          gesture.moveY > this.bottomEdge + this.yPosCorrect
        ) {
          disableDrag = true;
        }
        const realXPos =
          this.state.originValues.x + this.state.bottomLeft.x._value;
        const realYPos =
          this.state.originValues.y + this.state.bottomLeft.y._value;
        const rightEdge = this.state.bottomRight.x._value - 40;
        const topEdge = this.state.topLeft.y._value + 40;
        // if (event.nativeEvent.pageX <= 10) {
        //     disableDrag = true;
        //     console.log('edge page from Left')
        // }
        // if ((Dimensions.get('window').height - 90) <= event.nativeEvent.pageY) {
        //     disableDrag = true;
        //     console.log('edge page from Bottom')
        // }

        if (this.state.bottomLeft.x._value !== 0) {
          console.log('Move x', new Date().getTime());
          if (this.state.bottomLeft.x._value < 0) {
            console.log('Move x Left', new Date().getTime());
          } else {
            if (realXPos >= rightEdge) {
              disableDrag = true;
              console.log('This is the right edge', new Date().getTime());
            }
            console.log('Move x Right', new Date().getTime());
          }
        }
        if (this.state.bottomLeft.y._value !== 0) {
          console.log('Move y', new Date().getTime());
          if (this.state.bottomLeft.y._value < 0) {
            if (realYPos <= topEdge) {
              console.log('This is the top edge', new Date().getTime());
              disableDrag = true;
            }
            console.log('Move y Up', new Date().getTime());
          } else {
            console.log('Move y Down', new Date().getTime());
          }
        }
        const angleBottom = this.calculateAngle(
          {
            x: this.state.bottomRight.x._value,
            y: this.state.bottomRight.y._value,
          },
          {
            x: realXPos,
            y: realYPos,
          },
        );
        const angleLeft = this.calculateAngle(
          {
            x: this.state.topLeft.x._value,
            y: this.state.topLeft.y._value,
          },
          {
            x: realXPos,
            y: realYPos,
          },
        );
        const overlayPositions = `${this.state.topLeft.x._value + 20},${
          this.state.topLeft.y._value + 20
        } ${this.state.topRight.x._value + 20},${
          this.state.topRight.y._value + 20
        } ${this.state.bottomRight.x._value + 20},${
          this.state.bottomRight.y._value + 20
        } ${realXPos + 20},${realYPos + 20}`;
        this.setState({
          overlayPositions,
          angleBottom,
          angleLeft,
        });
        this.setState({
          showZoom: true,
          OFFSET_LEFT: realXPos,
          OFFSET_TOP: realYPos,
        });
        const bottomCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          {
            x: realXPos,
            y: realYPos,
          },
          this.state.bottomRight,
        );
        this.state.bottomCenter.setValue(bottomCenterAnimate);

        const leftCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.topLeft,
          {
            x: realXPos,
            y: realYPos,
          },
        );
        this.state.leftCenter.setValue(leftCenterAnimate);
        if (disableDrag) {
          return;
        }
        this.state.bottomLeft.setValue({x: gesture.dx, y: gesture.dy});
      },
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        this.state.bottomLeft.flattenOffset();
        // Animated.spring(this.state.bottomLeft, {
        //   toValue: 0,
        //   useNativeDriver: true,
        //   // toValue: {
        //   //     x: 0,
        //   //     y: 0,
        //   // },
        // }).start();
        this.updateOverlayString();
        this.setState({
          showZoom: false,
        });
      },
    });
    this.panResponderTopCenter = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetResponderCapture: () => true, //Tell iOS that we are allowing the movement
      onMoveShouldSetPanResponderCapture: () => true, // Same here, tell iOS that we allow dragging
      onPanResponderGrant: () => {
        const angleTopLeft = this.calculateAngle(
          {
            x: this.state.topLeft.x._value,
            y: this.state.topLeft.y._value,
          },
          {
            x: this.state.bottomLeft.x._value,
            y: this.state.bottomLeft.y._value,
          },
        );
        const angleTopRight = this.calculateAngle(
          {
            x: this.state.topRight.x._value,
            y: this.state.topRight.y._value,
          },
          {
            x: this.state.bottomRight.x._value,
            y: this.state.bottomRight.y._value,
          },
        );
        // console.log('angleTopLeft', 180 - angleTopLeft)
        // console.log('angleTopRight', angleTopRight)
        const angleTop = this.calculateAngle(
          {
            x: this.state.topRight.x._value,
            y: this.state.topRight.y._value,
          },
          {
            x: this.state.topLeft.x._value,
            y: this.state.topLeft.y._value,
          },
        );
        this.setState({
          originValues: {
            x: this.state.topCenter.x._value,
            y: this.state.topCenter.y._value,
          },
          originTopLeftValues: {
            x: this.state.topLeft.x._value,
            y: this.state.topLeft.y._value,
          },
          originTopRightValues: {
            x: this.state.topRight.x._value,
            y: this.state.topRight.y._value,
          },
          angleForTopCenter:
            180 - angleTopLeft <= angleTopRight ? angleTopRight : angleTopLeft,
          angleTop,
        });
        // this.state.topCenter.setOffset({
        //     x: 0,
        //     y: this.state.topCenter.y._value,
        // });
        // this.state.topCenter.setValue({x: this.state.topCenter.x._value, y: 0}); second opt only by y

        this.state.topCenter.flattenOffset();
        this.state.topLeft.flattenOffset();
        this.state.topRight.flattenOffset();
      },
      onPanResponderMove: (event, gesture) => {
        // const realXPos = this.state.originValues.x + (this.state.topCenter.x._value)
        // const realYPos = this.state.originValues.y + (this.state.topCenter.y._value)
        // console.log(JSON.stringify(gesture))
        // const moveY = realYPos - this.state.originValues.y;
        // console.log(gesture.moveY, moveY, gesture.dy)
        // const xPos = topCenterAnimate.x - realXPos; get real gesture.dx
        // const realXPos = this.state.originValues.x + (this.state.topCenter.x._value)
        // const rightEdge = this.state.topRight.x._value - 40;

        const realYPos = gesture.moveY - this.yPosCorrect;
        const bottomEdge = this.state.bottomCenter.y._value - 40;

        if (
          gesture.moveX < this.leftEdge + 15 ||
          gesture.moveX > this.rightEdge + 25 ||
          gesture.moveY < this.topEdge + this.yPosCorrect ||
          gesture.moveY > this.bottomEdge + this.yPosCorrect ||
          realYPos >= bottomEdge
        ) {
          return;
        }
        this.state.topRight.flattenOffset();
        const newTopRightPoint = this.findNewPoint(
          this.state.originTopRightValues.x,
          this.state.originTopRightValues.y,
          this.state.angleForTopCenter,
          gesture.dy,
        );
        this.state.topRight.setValue(newTopRightPoint);

        this.state.topLeft.flattenOffset();
        const newTopLeftPoint = this.findNewPoint(
          this.state.originTopLeftValues.x,
          this.state.originTopLeftValues.y,
          this.state.angleForTopCenter,
          gesture.dy,
        );
        this.state.topLeft.setValue(newTopLeftPoint);

        this.state.topCenter.flattenOffset();
        const topCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.topLeft,
          this.state.topRight,
        );
        this.state.topCenter.setValue({
          x: topCenterAnimate.x,
          y: topCenterAnimate.y,
        });
        //this.state.topCenter.setValue({x: topCenterAnimate.x, y: gesture.dy}); second opt only by y

        const rightCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.topRight,
          this.state.bottomRight,
        );
        this.state.rightCenter.setValue(rightCenterAnimate);

        const leftCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.topLeft,
          this.state.bottomLeft,
        );
        this.state.leftCenter.setValue(leftCenterAnimate);

        this.updateOverlayString();

        // console.log('x by findNewPoint', newPoint.x)
        // const aaaa = this.calculate(this.state.topLeft, this.state.bottomLeft, realYTopLeftPos)
        // console.log('x by calculate', newPoint.x)
        // const bcccc = this.calculate(this.state.originTopLeftValues, this.state.bottomLeft, realYTopLeftPos)
        // console.log('x by calculate 2', bcccc.x)
        // this.state.topLeft.flattenOffset();
        // this.state.topLeft.flattenOffset();
        // this.state.topCenter.flattenOffset();
        // const topCenterAnimate = this.calculateSizeOfLineByTwoPoints(this.state.topLeft, this.state.topRight)
        // this.state.topCenter.setValue(topCenterAnimate);
      },
      onPanResponderRelease: () => {
        console.log('onPanResponderRelease');
        this.state.topCenter.flattenOffset();
        this.state.topLeft.flattenOffset();
        this.state.topRight.flattenOffset();

        // Animated.spring(this.state.topCenter, {
        //   useNativeDriver: true,
        //   toValue: {
        //       x: 0,
        //       y: 0,
        //   },
        // }).start();
        // Animated.spring(this.state.topLeft, {
        //   useNativeDriver: true,
        //   toValue: {
        //       x: 0,
        //       y: 0,
        //   },
        // }).start();
        // Animated.spring(this.state.topRight, {
        //   useNativeDriver: true,
        //   toValue: {
        //       x: 0,
        //       y: 0,
        //   },
        // }).start();
        this.updateOverlayString();
      },
    });
    this.panResponderBottomCenter = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetResponderCapture: () => true, //Tell iOS that we are allowing the movement
      onMoveShouldSetPanResponderCapture: () => true, // Same here, tell iOS that we allow dragging
      onPanResponderGrant: () => {
        const angleBottomLeft = this.calculateAngle(
          {
            x: this.state.topLeft.x._value,
            y: this.state.topLeft.y._value,
          },
          {
            x: this.state.bottomLeft.x._value,
            y: this.state.bottomLeft.y._value,
          },
        );
        const angleBottomRight = this.calculateAngle(
          {
            x: this.state.topRight.x._value,
            y: this.state.topRight.y._value,
          },
          {
            x: this.state.bottomRight.x._value,
            y: this.state.bottomRight.y._value,
          },
        );
        // console.log('angleBottomLeft', 180 - angleBottomLeft)
        // console.log('angleBottomRight', angleBottomRight)
        const angleBottom = this.calculateAngle(
          {
            x: this.state.bottomRight.x._value,
            y: this.state.bottomRight.y._value,
          },
          {
            x: this.state.bottomLeft.x._value,
            y: this.state.bottomLeft.y._value,
          },
        );
        this.setState({
          originValues: {
            x: this.state.bottomCenter.x._value,
            y: this.state.bottomCenter.y._value,
          },
          originBottomLeftValues: {
            x: this.state.bottomLeft.x._value,
            y: this.state.bottomLeft.y._value,
          },
          originBottomRightValues: {
            x: this.state.bottomRight.x._value,
            y: this.state.bottomRight.y._value,
          },
          angleForBottomCenter:
            180 - angleBottomLeft <= angleBottomRight
              ? angleBottomRight
              : angleBottomLeft,
          angleBottom,
        });
        this.state.bottomCenter.flattenOffset();
        this.state.bottomLeft.flattenOffset();
        this.state.bottomRight.flattenOffset();
      },
      onPanResponderMove: (event, gesture) => {
        const realYPos = gesture.moveY - this.yPosCorrect;
        const topEdge = this.state.topCenter.y._value + 40;
        if (
          gesture.moveX < this.leftEdge + 15 ||
          gesture.moveX > this.rightEdge + 25 ||
          gesture.moveY < this.topEdge + this.yPosCorrect ||
          gesture.moveY > this.bottomEdge + this.yPosCorrect ||
          realYPos <= topEdge
        ) {
          return;
        }
        this.state.bottomRight.flattenOffset();
        const newBottomRightPoint = this.findNewPoint(
          this.state.originBottomRightValues.x,
          this.state.originBottomRightValues.y,
          this.state.angleForBottomCenter,
          gesture.dy,
        );
        this.state.bottomRight.setValue(newBottomRightPoint);

        this.state.bottomLeft.flattenOffset();
        const newBottomLeftPoint = this.findNewPoint(
          this.state.originBottomLeftValues.x,
          this.state.originBottomLeftValues.y,
          this.state.angleForBottomCenter,
          gesture.dy,
        );
        this.state.bottomLeft.setValue(newBottomLeftPoint);

        this.state.bottomCenter.flattenOffset();
        const bottomCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.bottomLeft,
          this.state.bottomRight,
        );
        this.state.bottomCenter.setValue({
          x: bottomCenterAnimate.x,
          y: bottomCenterAnimate.y,
        });

        const rightCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.topRight,
          this.state.bottomRight,
        );
        this.state.rightCenter.setValue(rightCenterAnimate);

        const leftCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.topLeft,
          this.state.bottomLeft,
        );
        this.state.leftCenter.setValue(leftCenterAnimate);

        this.updateOverlayString();
      },
      onPanResponderRelease: () => {
        console.log('onPanResponderRelease');
        this.state.bottomCenter.flattenOffset();
        this.state.bottomLeft.flattenOffset();
        this.state.bottomRight.flattenOffset();

        // Animated.spring(this.state.bottomCenter, {
        //   toValue: 0,
        //   useNativeDriver: true,
        //   // toValue: {
        //   //     x: 0,
        //   //     y: 0,
        //   // },
        // }).start();
        // Animated.spring(this.state.bottomLeft, {
        //   toValue: 0,
        //   useNativeDriver: true,
        //   // toValue: {
        //   //     x: 0,
        //   //     y: 0,
        //   // },
        // }).start();
        // Animated.spring(this.state.bottomRight, {
        //   toValue: 0,
        //   useNativeDriver: true,
        //   // toValue: {
        //   //     x: 0,
        //   //     y: 0,
        //   // },
        // }).start();
        this.updateOverlayString();
      },
    });
    this.panResponderRightCenter = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetResponderCapture: () => true, //Tell iOS that we are allowing the movement
      onMoveShouldSetPanResponderCapture: () => true, // Same here, tell iOS that we allow dragging
      onPanResponderGrant: () => {
        const angleTopRight = this.calculateAngle(
          {
            x: this.state.topLeft.x._value,
            y: this.state.topLeft.y._value,
          },
          {
            x: this.state.topRight.x._value,
            y: this.state.topRight.y._value,
          },
        );
        const angleBottomRight = this.calculateAngle(
          {
            x: this.state.bottomLeft.x._value,
            y: this.state.bottomLeft.y._value,
          },
          {
            x: this.state.bottomRight.x._value,
            y: this.state.bottomRight.y._value,
          },
        );
        const angleRight = this.calculateAngle(
          {
            x: this.state.topRight.x._value,
            y: this.state.topRight.y._value,
          },
          {
            x: this.state.bottomRight.x._value,
            y: this.state.bottomRight.y._value,
          },
        );
        this.setState({
          originValues: {
            x: this.state.rightCenter.x._value,
            y: this.state.rightCenter.y._value,
          },
          originBottomRightValues: {
            x: this.state.bottomRight.x._value,
            y: this.state.bottomRight.y._value,
          },
          originTopRightValues: {
            x: this.state.topRight.x._value,
            y: this.state.topRight.y._value,
          },
          angleForRightCenter:
            180 - angleBottomRight <= angleTopRight
              ? angleBottomRight
              : angleTopRight,
          angleRight,
        });
        this.state.rightCenter.flattenOffset();
        this.state.topRight.flattenOffset();
        this.state.bottomRight.flattenOffset();
      },
      onPanResponderMove: (event, gesture) => {
        const leftEdge = this.state.leftCenter.x._value + 15 + 40;
        if (
          gesture.moveX < this.leftEdge + 15 ||
          gesture.moveX > this.rightEdge + 25 ||
          gesture.moveY < this.topEdge + this.yPosCorrect ||
          gesture.moveY > this.bottomEdge + this.yPosCorrect ||
          gesture.moveX <= leftEdge
        ) {
          return;
        }
        this.state.topRight.flattenOffset();
        const newTopRightPoint = this.findNewPoint(
          this.state.originTopRightValues.x,
          this.state.originTopRightValues.y,
          this.state.angleForRightCenter,
          gesture.dx,
        );
        this.state.topRight.setValue(newTopRightPoint);

        this.state.bottomRight.flattenOffset();
        const newBottomRightPoint = this.findNewPoint(
          this.state.originBottomRightValues.x,
          this.state.originBottomRightValues.y,
          this.state.angleForRightCenter,
          gesture.dx,
        );
        this.state.bottomRight.setValue(newBottomRightPoint);

        this.state.rightCenter.flattenOffset();
        const rightCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.topRight,
          this.state.bottomRight,
        );
        this.state.rightCenter.setValue({
          x: rightCenterAnimate.x,
          y: rightCenterAnimate.y,
        });

        const topCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.topLeft,
          this.state.topRight,
        );
        this.state.topCenter.setValue(topCenterAnimate);

        const bottomCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.bottomLeft,
          this.state.bottomRight,
        );
        this.state.bottomCenter.setValue(bottomCenterAnimate);

        this.updateOverlayString();
      },
      onPanResponderRelease: () => {
        console.log('onPanResponderRelease');
        this.state.rightCenter.flattenOffset();
        this.state.bottomRight.flattenOffset();
        this.state.topRight.flattenOffset();

        // Animated.spring(this.state.rightCenter, {
        //   toValue: 0,
        //   useNativeDriver: true,
        //   // toValue: {
        //   //     x: 0,
        //   //     y: 0,
        //   // },
        // }).start();
        // Animated.spring(this.state.bottomRight, {
        //   toValue: 0,
        //   useNativeDriver: true,
        //   // toValue: {
        //   //     x: 0,
        //   //     y: 0,
        //   // },
        // }).start();
        // Animated.spring(this.state.topRight, {
        //   toValue: 0,
        //   useNativeDriver: true,
        //   // toValue: {
        //   //     x: 0,
        //   //     y: 0,
        //   // },
        // }).start();
        this.updateOverlayString();
      },
    });
    this.panResponderLeftCenter = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetResponderCapture: () => true, //Tell iOS that we are allowing the movement
      onMoveShouldSetPanResponderCapture: () => true, // Same here, tell iOS that we allow dragging
      onPanResponderGrant: () => {
        const angleTopRight = this.calculateAngle(
          {
            x: this.state.topLeft.x._value,
            y: this.state.topLeft.y._value,
          },
          {
            x: this.state.topRight.x._value,
            y: this.state.topRight.y._value,
          },
        );
        const angleBottomRight = this.calculateAngle(
          {
            x: this.state.bottomLeft.x._value,
            y: this.state.bottomLeft.y._value,
          },
          {
            x: this.state.bottomRight.x._value,
            y: this.state.bottomRight.y._value,
          },
        );
        const angleLeft = this.calculateAngle(
          {
            x: this.state.topLeft.x._value,
            y: this.state.topLeft.y._value,
          },
          {
            x: this.state.bottomLeft.x._value,
            y: this.state.bottomLeft.y._value,
          },
        );
        this.setState({
          originValues: {
            x: this.state.leftCenter.x._value,
            y: this.state.leftCenter.y._value,
          },
          originBottomLeftValues: {
            x: this.state.bottomLeft.x._value,
            y: this.state.bottomLeft.y._value,
          },
          originTopLeftValues: {
            x: this.state.topLeft.x._value,
            y: this.state.topLeft.y._value,
          },
          angleForLeftCenter:
            180 - angleBottomRight <= angleTopRight
              ? angleTopRight
              : angleBottomRight,
          angleLeft,
        });
        this.state.leftCenter.flattenOffset();
        this.state.topLeft.flattenOffset();
        this.state.bottomLeft.flattenOffset();
      },
      onPanResponderMove: (event, gesture) => {
        const rightEdge = this.state.rightCenter.x._value + 25 - 40;
        if (
          gesture.moveX < this.leftEdge + 15 ||
          gesture.moveX > this.rightEdge + 25 ||
          gesture.moveY < this.topEdge + this.yPosCorrect ||
          gesture.moveY > this.bottomEdge + this.yPosCorrect ||
          gesture.moveX >= rightEdge
        ) {
          return;
        }
        this.state.topLeft.flattenOffset();
        const newTopLeftPoint = this.findNewPoint(
          this.state.originTopLeftValues.x,
          this.state.originTopLeftValues.y,
          this.state.angleForLeftCenter,
          gesture.dx,
        );
        this.state.topLeft.setValue(newTopLeftPoint);

        this.state.bottomLeft.flattenOffset();
        const newBottomLeftPoint = this.findNewPoint(
          this.state.originBottomLeftValues.x,
          this.state.originBottomLeftValues.y,
          this.state.angleForLeftCenter,
          gesture.dx,
        );
        this.state.bottomLeft.setValue(newBottomLeftPoint);

        this.state.leftCenter.flattenOffset();
        const leftCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.topLeft,
          this.state.bottomLeft,
        );
        this.state.leftCenter.setValue({
          x: leftCenterAnimate.x,
          y: leftCenterAnimate.y,
        });

        const topCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.topLeft,
          this.state.topRight,
        );
        this.state.topCenter.setValue(topCenterAnimate);

        const bottomCenterAnimate = this.calculateSizeOfLineByTwoPoints(
          this.state.bottomLeft,
          this.state.bottomRight,
        );
        this.state.bottomCenter.setValue(bottomCenterAnimate);

        this.updateOverlayString();
      },
      onPanResponderRelease: () => {
        console.log('onPanResponderRelease');
        this.state.leftCenter.flattenOffset();
        this.state.topLeft.flattenOffset();
        this.state.bottomLeft.flattenOffset();

        // Animated.spring(this.state.leftCenter, {
        //   toValue: 0,
        //   useNativeDriver: true,
        //   // toValue: {
        //   //     x: 0,
        //   //     y: 0,
        //   // },
        // }).start();
        // Animated.spring(this.state.topLeft, {
        //   toValue: 0,
        //   useNativeDriver: true,
        //   // toValue: {
        //   //     x: 0,
        //   //     y: 0,
        //   // },
        // }).start();
        // Animated.spring(this.state.bottomLeft, {
        //   toValue: 0,
        //   useNativeDriver: true,
        //   // toValue: {
        //   //     x: 0,
        //   //     y: 0,
        //   // },
        // }).start();
        this.updateOverlayString();
      },
    });

    setTimeout(() => {
      this.proceedDetectRectangleImage().then(() => {});
    }, 0);
  }

  handleShouldSetPanResponder = (e, gestureState) => {
    return (
      e.nativeEvent.touches.length === 1 && !this.gestureIsPress(gestureState)
    );
  };

  gestureIsPress = gestureState => {
    return Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5;
  };

  slideClose = () => {
    const {closeCrop} = this.props;
    closeCrop();
  };

  returnToCamera = () => {
    const {returnToCamera} = this.props;
    returnToCamera();
  };
  closeAlertModal = () => {
    const modalAlert = Object.assign({}, this.state.modalAlert);
    modalAlert.visible = false;
    modalAlert.children = {
      header: null,
      body: null,
      footer: null,
    };
    modalAlert.styleWrap = null;
    this.setState({
      modalAlert,
    });
  };

  detectRectangle(imageAsBase64) {
    return new Promise((resolve, reject) => {
      if (Platform.OS === 'android') {
        OpenCV.detectRectangle(
          imageAsBase64,
          error => {
            resolve(error);
          },
          msg => {
            resolve(msg);
          },
        );
      } else {
        OpenCV.detectRectangle(imageAsBase64, (error, dataArray) => {
          resolve(dataArray);
        });
      }
    });
  }

  async proceedDetectRectangleImage() {
    this.detectRectangle(this.props.initialImageBase64)
      .then(res => {
        console.log(res);
        const corners = res.detectedRectangle;
        try {
          if (corners) {
            let cornerArray = [
              {corner: corners.topLeft},
              {corner: corners.topRight},
              {corner: corners.bottomLeft},
              {corner: corners.bottomRight},
            ];
            cornerArray
              .sort((item1, item2) => {
                return item1.corner.y < item2.corner.y
                  ? -1
                  : item1.corner.y > item2.corner.y
                  ? 1
                  : 0;
              })
              .slice(0, 5);

            //Determine left/right based on x position of top and bottom 2
            let tl =
              cornerArray[0].corner.x < cornerArray[1].corner.x
                ? cornerArray[0]
                : cornerArray[1];
            let tr =
              cornerArray[0].corner.x > cornerArray[1].corner.x
                ? cornerArray[0]
                : cornerArray[1];
            let bl =
              cornerArray[2].corner.x < cornerArray[3].corner.x
                ? cornerArray[2]
                : cornerArray[3];
            let br =
              cornerArray[2].corner.x > cornerArray[3].corner.x
                ? cornerArray[2]
                : cornerArray[3];

            const topLeftCorner = this.imageCoordinatesToViewCoordinates(
              tl.corner,
            );
            topLeftCorner.x -= 20;
            topLeftCorner.y -= 20;

            const topRightCorner = this.imageCoordinatesToViewCoordinates(
              tr.corner,
            );
            topRightCorner.x -= 20;
            topRightCorner.y -= 20;

            const bottomRightCorner = this.imageCoordinatesToViewCoordinates(
              br.corner,
            );
            bottomRightCorner.x -= 20;
            bottomRightCorner.y -= 20;

            const bottomLeftCorner = this.imageCoordinatesToViewCoordinates(
              bl.corner,
            );
            bottomLeftCorner.x -= 20;
            bottomLeftCorner.y -= 20;

            const rightCenterAnimate = this.calculateSpaceOfLineByTwoPoints(
              topRightCorner,
              bottomRightCorner,
            );
            const leftCenterAnimate = this.calculateSpaceOfLineByTwoPoints(
              topLeftCorner,
              bottomLeftCorner,
            );
            const topCenterAnimate = this.calculateSpaceOfLineByTwoPoints(
              topLeftCorner,
              topRightCorner,
            );
            const bottomCenterAnimate = this.calculateSpaceOfLineByTwoPoints(
              bottomLeftCorner,
              bottomRightCorner,
            );

            const height =
              rightCenterAnimate > leftCenterAnimate
                ? rightCenterAnimate
                : leftCenterAnimate;
            const width =
              topCenterAnimate > bottomCenterAnimate
                ? topCenterAnimate
                : bottomCenterAnimate;
            const eighthHeight = this.state.height / 8;
            const eighthWidth = this.state.width / 8;

            console.log('The height between two points:', height);
            console.log('The width between two points:', width);

            console.log('eighthHeight  from img: ', eighthHeight);
            console.log('eighthWidth from img: ', eighthWidth);

            // if (
            //     (eighthHeight > height)
            //     ||
            //     (eighthWidth > width)
            // ) {
            //     this.setState({
            //         detectRectangleImage: true,
            //     })
            // } else {
            this.state.topLeft.setValue(topLeftCorner);
            this.state.topRight.setValue(topRightCorner);
            this.state.bottomRight.setValue(bottomRightCorner);
            this.state.bottomLeft.setValue(bottomLeftCorner);
            this.updateOverlayString();
            // }
          }
        } catch (e) {
          console.log(e);
        }

        this.setState({
          detectRectangleImage: true,
        });
      })
      .catch(err => {
        this.setState({
          detectRectangleImage: true,
        });
        console.log('err', err);
      });
    //         try {
    //             const base64 = await RNFS.readFile(this.state.initialImageBase64, 'base64');
    //             this.setState({
    //                 initialImageBase64: base64,
    //             }, ()=>{
    //                 // debugger
    //                 this.detectRectangle(this.props.initialImageBase64).then(res => {
    //                     console.log(res)
    //                     const corners = res.detectedRectangle;
    //                     try {
    //                         if (corners) {
    //                             let cornerArray = [{corner: corners.topLeft}, {corner: corners.topRight}, {corner: corners.bottomLeft}, {corner: corners.bottomRight}];
    //                             cornerArray.sort((item1, item2) => {
    //                                 return (item1.corner.y < item2.corner.y) ? -1 : (item1.corner.y > item2.corner.y) ? 1 : 0;
    //                             }).slice(0, 5);
    //
    // //Determine left/right based on x position of top and bottom 2
    //                             let tl = cornerArray[0].corner.x < cornerArray[1].corner.x ? cornerArray[0] : cornerArray[1];
    //                             let tr = cornerArray[0].corner.x > cornerArray[1].corner.x ? cornerArray[0] : cornerArray[1];
    //                             let bl = cornerArray[2].corner.x < cornerArray[3].corner.x ? cornerArray[2] : cornerArray[3];
    //                             let br = cornerArray[2].corner.x > cornerArray[3].corner.x ? cornerArray[2] : cornerArray[3];
    //
    //                             const topLeftCorner = this.imageCoordinatesToViewCoordinates(tl.corner)
    //                             topLeftCorner.x -= 20;
    //                             topLeftCorner.y -= 20;
    //                             this.state.topLeft.setValue(topLeftCorner);
    //
    //                             const topRightCorner = this.imageCoordinatesToViewCoordinates(tr.corner)
    //                             topRightCorner.x -= 20;
    //                             topRightCorner.y -= 20;
    //                             this.state.topRight.setValue(topRightCorner);
    //
    //                             const bottomRightCorner = this.imageCoordinatesToViewCoordinates(br.corner)
    //                             bottomRightCorner.x -= 20;
    //                             bottomRightCorner.y -= 20;
    //                             this.state.bottomRight.setValue(bottomRightCorner);
    //
    //                             const bottomLeftCorner = this.imageCoordinatesToViewCoordinates(bl.corner)
    //                             bottomLeftCorner.x -= 20;
    //                             bottomLeftCorner.y -= 20;
    //                             this.state.bottomLeft.setValue(bottomLeftCorner);
    //
    //                             this.updateOverlayString()
    //                         }
    //                     } catch (e) {
    //                         console.log(e)
    //                     }
    //
    //                     this.setState({
    //                         detectRectangleImage: true,
    //                     })
    //
    //                 }).catch(err => {
    //                     this.setState({
    //                         detectRectangleImage: true,
    //                     })
    //                     console.log('err', err)
    //                 });
    //             })
    //
    //         } catch (err) {
    //             console.log(err);
    //             this.setState({
    //                 detectRectangleImage: true,
    //             })
    //         }
  }

  calculateSpaceOfLineByTwoPoints(pointA, pointB) {
    var x1 = pointA.x._value !== undefined ? pointA.x._value : pointA.x;
    var y1 = pointA.y._value !== undefined ? pointA.y._value : pointA.y;
    var x2 = pointB.x._value !== undefined ? pointB.x._value : pointB.x;
    var y2 = pointB.y._value !== undefined ? pointB.y._value : pointB.y;
    var xlen = x2 - x1;
    var ylen = y2 - y1;
    var hlen = Math.sqrt(Math.pow(xlen, 2) + Math.pow(ylen, 2));
    return hlen;
  }

  cropAndPerspectiveTransformCorrection(imageAsBase64, corners) {
    return new Promise((resolve, reject) => {
      if (Platform.OS === 'android') {
        OpenCV.cropAndPerspectiveTransformCorrection(
          imageAsBase64,
          corners,
          error => {
            // error handling
            resolve(error);
          },
          msg => {
            resolve(msg);
          },
        );
      } else {
        OpenCV.cropAndPerspectiveTransformCorrection(
          imageAsBase64,
          corners,
          (error, dataArray) => {
            resolve(dataArray);
          },
        );
      }
    });
  }

  updateImage = takeMorePictureFromCrop => {
    this.props.updateImage(this.state.image, !!takeMorePictureFromCrop);
  };

  takeMorePictureFromCrop = () => {
    this.crop(true);
  };

  crop = takeMorePictureFromCrop => {
    takeMorePictureFromCrop =
      typeof takeMorePictureFromCrop === 'boolean' &&
      takeMorePictureFromCrop === true;

    const topLeftCorner = this.viewCoordinatesToImageCoordinates(
      this.state.topLeft,
    );
    const topRightCorner = this.viewCoordinatesToImageCoordinates(
      this.state.topRight,
    );
    const bottomRightCorner = this.viewCoordinatesToImageCoordinates(
      this.state.bottomRight,
    );
    const bottomLeftCorner = this.viewCoordinatesToImageCoordinates(
      this.state.bottomLeft,
    );

    const angleTop = this.calculateAngle(topLeftCorner, topRightCorner);
    const angleBottom = this.calculateAngle(
      bottomLeftCorner,
      bottomRightCorner,
    );
    const angleRight = this.calculateAngle(topRightCorner, bottomRightCorner);
    const angleLeft = this.calculateAngle(topLeftCorner, bottomLeftCorner);

    // console.log('------Top', angleTop + 90)
    // console.log('-----Bottom', angleBottom + 90)
    // console.log('-----Right', angleRight)
    // console.log('---Left', angleLeft)

    if (
      angleTop + 90 < 70 ||
      angleBottom + 90 < 70 ||
      angleRight < 70 ||
      angleLeft < 70
    ) {
      const modalAlert = Object.assign({}, this.state.modalAlert);
      modalAlert.visible = true;
      modalAlert.children = {
        header: (
          <View
            style={{
              height: 40,
              flexDirection: 'row-reverse',
              justifyContent: 'flex-start',
              alignSelf: 'flex-end',
              width: 137,
              borderBottomWidth: 1,
              borderBottomColor: '#022258',
            }}>
            <Text
              style={{
                paddingHorizontal: 20,
                paddingTop: 10,
                color: '#022258',
                fontSize: sp(18),
                fontFamily: fonts.semiBold,
                textAlign: 'center',
              }}>
              {'שגיאה'}
            </Text>
          </View>
        ),
        body: (
          <Text
            style={{
              paddingHorizontal: 20,
              color: '#022258',
              fontSize: sp(18),
              fontFamily: fonts.semiBold,
              textAlign: 'right',
            }}>
            {'צורת החיתוך לא תקינה'}
          </Text>
        ),
        footer: (
          <View
            style={{
              marginHorizontal: 20,
              height: 45,
              flexDirection: 'row-reverse',
              justifyContent: 'flex-end',
            }}>
            <TouchableOpacity
              onPress={this.closeAlertModal}
              style={{
                width: 65,
              }}>
              <Text
                style={{
                  color: '#038ed6',
                  fontSize: sp(18),
                  fontFamily: fonts.semiBold,
                }}>
                {'אישור'}
              </Text>
            </TouchableOpacity>
          </View>
        ),
      };
      modalAlert.styleWrap = {
        backgroundColor: 'white',
        borderRadius: 8,
        position: 'absolute',
        top: 127,
        right: '50%',
        marginRight: -160,
        height: 174.5,
        width: 320,
        flexDirection: 'column',
      };
      return this.setState({
        modalAlert,
      });
    }

    const corners = {
      topLeft: topLeftCorner,
      topRight: topRightCorner,
      bottomRight: bottomRightCorner,
      bottomLeft: bottomLeftCorner,
      height: this.state.height,
      width: this.state.width,
    };
    this.cropAndPerspectiveTransformCorrection(
      this.props.initialImageBase64,
      corners,
    )
      .then(res => {
        console.log(res);
        if (res && res.newImage) {
          this.setState({
            image: res.newImage,
            newImage: true,
          });
        } else {
          this.setState({
            newImage: true,
          });
        }
        this.updateImage(takeMorePictureFromCrop);
        // this.slideClose()
      })
      .catch(err => {
        console.log('err', err);
        this.setState({
          newImage: true,
        });
        if (takeMorePictureFromCrop) {
          this.props.takeMorePictureFromCrop();
        } else {
          this.slideClose();
        }
      });
  };

  updateOverlayString() {
    const rightCenterAnimate = this.calculateSizeOfLineByTwoPoints(
      this.state.topRight,
      this.state.bottomRight,
    );
    this.state.rightCenter.setValue(rightCenterAnimate);

    const leftCenterAnimate = this.calculateSizeOfLineByTwoPoints(
      this.state.topLeft,
      this.state.bottomLeft,
    );
    this.state.leftCenter.setValue(leftCenterAnimate);

    const topCenterAnimate = this.calculateSizeOfLineByTwoPoints(
      this.state.topLeft,
      this.state.topRight,
    );
    this.state.topCenter.setValue(topCenterAnimate);

    const bottomCenterAnimate = this.calculateSizeOfLineByTwoPoints(
      this.state.bottomLeft,
      this.state.bottomRight,
    );
    this.state.bottomCenter.setValue(bottomCenterAnimate);

    const angleTop = this.calculateAngle(
      {
        x: this.state.topRight.x._value,
        y: this.state.topRight.y._value,
      },
      {
        x: this.state.topLeft.x._value,
        y: this.state.topLeft.y._value,
      },
    );
    const angleBottom = this.calculateAngle(
      {
        x: this.state.bottomRight.x._value,
        y: this.state.bottomRight.y._value,
      },
      {
        x: this.state.bottomLeft.x._value,
        y: this.state.bottomLeft.y._value,
      },
    );
    const angleRight = this.calculateAngle(
      {
        x: this.state.topRight.x._value,
        y: this.state.topRight.y._value,
      },
      {
        x: this.state.bottomRight.x._value,
        y: this.state.bottomRight.y._value,
      },
    );
    const angleLeft = this.calculateAngle(
      {
        x: this.state.topLeft.x._value,
        y: this.state.topLeft.y._value,
      },
      {
        x: this.state.bottomLeft.x._value,
        y: this.state.bottomLeft.y._value,
      },
    );
    this.setState({
      overlayPositions: `${this.state.topLeft.x._value + 20},${
        this.state.topLeft.y._value + 20
      } ${this.state.topRight.x._value + 20},${
        this.state.topRight.y._value + 20
      } ${this.state.bottomRight.x._value + 20},${
        this.state.bottomRight.y._value + 20
      } ${this.state.bottomLeft.x._value + 20},${
        this.state.bottomLeft.y._value + 20
      }`,
      angleTop,
      angleBottom,
      angleRight,
      angleLeft,
    });
  }

  imageCoordinatesToViewCoordinates(corner) {
    return {
      x: (corner.x * Dimensions.get('window').width) / this.state.width,
      y: (corner.y * this.state.viewHeight) / this.state.height,
    };
  }

  viewCoordinatesToImageCoordinates(corner) {
    return {
      x:
        ((corner.x._value + 20) / Dimensions.get('window').width) *
        this.state.width,
      y: ((corner.y._value + 20) / this.state.viewHeight) * this.state.height,
    };
  }

  goToEditAgain = () => {
    this.setState({
      newImage: false,
      image: this.props.initialImage,
    });
  };

  calculate(pointA, pointB, posBy) {
    var x1 = pointA.x._value !== undefined ? pointA.x._value : pointA.x;
    var y1 = pointA.y._value !== undefined ? pointA.y._value : pointA.y;

    var x2 = pointB.x._value !== undefined ? pointB.x._value : pointB.x;
    var y2 = pointB.y._value !== undefined ? pointB.y._value : pointB.y;

    // Determine line lengths
    var xlen = x2 - x1;
    var ylen = y2 - y1;
    // Determine hypotenuse length - get size/width of line between two positions
    var hlen = Math.sqrt(Math.pow(xlen, 2) + Math.pow(ylen, 2));
    // console.log('hlen: ', hlen, posBy)

    // Determine the ratio between they shortened value and the full hypotenuse.
    var ratio = posBy / hlen;

    var smallerXLen = xlen * ratio;
    var smallerYLen = ylen * ratio;

    // The new X point is the starting x plus the smaller x length.
    var smallerX = x1 + smallerXLen;

    // Same goes for the new Y.
    var smallerY = y1 + smallerYLen;

    const corner = {
      x: smallerX,
      y: smallerY,
    };
    return corner;
  }

  calculateSizeOfLineByTwoPoints(pointA, pointB) {
    var x1 = pointA.x._value !== undefined ? pointA.x._value : pointA.x;
    var y1 = pointA.y._value !== undefined ? pointA.y._value : pointA.y;
    var x2 = pointB.x._value !== undefined ? pointB.x._value : pointB.x;
    var y2 = pointB.y._value !== undefined ? pointB.y._value : pointB.y;
    var xlen = x2 - x1;
    var ylen = y2 - y1;
    var hlen = Math.sqrt(Math.pow(xlen, 2) + Math.pow(ylen, 2));
    const posBy = hlen / 2 - 20;
    var ratio = posBy / hlen;
    var smallerXLen = xlen * ratio;
    var smallerYLen = ylen * ratio;
    var smallerX = x1 + smallerXLen;
    var smallerY = y1 + smallerYLen;
    return {
      x: smallerX + 20,
      y: smallerY + 20,
    };
  }

  findNewPoint(x, y, angle, distance) {
    var result = {};
    result.x = Math.round(Math.cos((angle * Math.PI) / 180) * distance + x);
    result.y = Math.round(Math.sin((angle * Math.PI) / 180) * distance + y);
    return result;
  }

  calculateAngle(p1, p2) {
    // angle in degrees
    var angleDeg = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
    console.log('angleDeg', 180 - angleDeg);
    return angleDeg;
  }

  render() {
    const OFFSET_LEFT = this.state.OFFSET_LEFT || 1;
    const OFFSET_TOP = this.state.OFFSET_TOP || 1;
    const overlayPositions = this.state.overlayPositions.split(' ');
    const topLeft = overlayPositions[0].split(',');
    const topRight = overlayPositions[1].split(',');
    const bottomRight = overlayPositions[2].split(',');
    const bottomLeft = overlayPositions[3].split(',');
    const {modalAlert} = this.state;

    return (
      <View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
            elevation: 999,
            zIndex: 99999,
            alignSelf: 'center',
            width: '100%',
            height: '100%',
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'black',
          },
        ]}>
        <HeaderHeightContext.Consumer>
          {headerHeight => {
            this.headerHeight = headerHeight;
            console.log('headerHeight: ', headerHeight);
          }}
        </HeaderHeightContext.Consumer>
        <TouchableOpacity
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          onPress={this.returnToCamera}
          style={s(this.props).closeCrop}>
          <Image
            style={[
              {
                alignSelf: 'center',
                resizeMode: 'contain',
                width: 11.5,
                height: 20,
              },
            ]}
            source={require('BiziboxUI/assets/returnToCamera.png')}
          />
        </TouchableOpacity>
        {/*<TouchableOpacity*/}
        {/*    hitSlop={{*/}
        {/*        top: 10,*/}
        {/*        bottom: 10,*/}
        {/*        left: 10,*/}
        {/*        right: 10,*/}
        {/*    }}*/}
        {/*    onPress={this.state.newImage === true ? this.goToEditAgain : this.returnToCamera}*/}
        {/*    style={s(this.props).closeCrop}>*/}
        {/*    {(this.state.newImage === true) ? (*/}
        {/*        <Image*/}
        {/*            style={[*/}
        {/*                {*/}
        {/*                    alignSelf: 'center',*/}
        {/*                    resizeMode: 'contain',*/}
        {/*                    width: 11.5,*/}
        {/*                    height: 20,*/}
        {/*                }]}*/}
        {/*            source={require('BiziboxUI/assets/returnToCamera.png')}*/}
        {/*        />*/}
        {/*    ) : (*/}
        {/*        <Image*/}
        {/*            style={[*/}
        {/*                {*/}
        {/*                    alignSelf: 'center',*/}
        {/*                    resizeMode: 'contain',*/}
        {/*                    width: 17,*/}
        {/*                    height: 17,*/}
        {/*                }]}*/}
        {/*            source={require('BiziboxUI/assets/closeCameraModal.png')}*/}
        {/*        />*/}
        {/*    )}*/}
        {/*</TouchableOpacity>*/}

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginTop: this.marginTopContainer,
          }}>
          <View
            style={[
              s(this.props).cropContainer,
              {
                height: this.state.viewHeight,
              },
            ]}>
            {/*<Image*/}
            {/*    style={[*/}
            {/*        s(this.props).image,*/}
            {/*        {height: this.state.viewHeight},*/}
            {/*    ]}*/}
            {/*    resizeMode="contain"*/}
            {/*    source={{uri: this.state.newImage === false ? this.state.image : `data:image/jpg;base64,${this.state.image}`}}*/}
            {/*/>*/}

            <FastImage
              style={[s(this.props).image, {height: this.state.viewHeight}]}
              source={{
                uri:
                  this.state.newImage === false
                    ? this.state.image
                    : `data:image/jpg;base64,${this.state.image}`,
                priority: FastImage.priority.high,
              }}
              resizeMode={FastImage.resizeMode.contain}
            />

            {/*<ImageBackground*/}
            {/*    style={[*/}
            {/*        s(this.props).image,*/}
            {/*        {height: this.state.viewHeight},*/}
            {/*    ]}*/}
            {/*    source={{uri: this.state.newImage === false ? this.state.image : `data:image/jpg;base64,${this.state.image}`}}>*/}

            {/*</ImageBackground>*/}

            {this.state.newImage === false &&
              this.state.detectRectangleImage === true && (
                <Fragment>
                  <Svg
                    height={this.state.viewHeight}
                    width={Dimensions.get('window').width}
                    style={{position: 'absolute', left: 0, top: 0}}>
                    <AnimatedPolygon
                      ref={ref => (this.polygon = ref)}
                      fill={'#038ed6'}
                      fillOpacity={0}
                      stroke={'#038ed6'}
                      points={this.state.overlayPositions}
                      strokeWidth={1.5}
                    />

                    <Circle
                      cx={topLeft[0]}
                      cy={topLeft[1]}
                      r="13"
                      strokeWidth="1"
                      stroke="#038ed6"
                      fill="white"
                    />
                    <Circle
                      cx={topRight[0]}
                      cy={topRight[1]}
                      r="13"
                      strokeWidth="1"
                      stroke="#038ed6"
                      fill="white"
                    />
                    <Circle
                      cx={bottomRight[0]}
                      cy={bottomRight[1]}
                      r="13"
                      strokeWidth="1"
                      stroke="#038ed6"
                      fill="white"
                    />
                    <Circle
                      cx={bottomLeft[0]}
                      cy={bottomLeft[1]}
                      r="13"
                      strokeWidth="1"
                      stroke="#038ed6"
                      fill="white"
                    />
                    <Rect
                      width="51"
                      height="10"
                      rx="5"
                      transform={
                        'rotate(' +
                        (this.state.angleTop + 180) +
                        ',' +
                        this.state.topCenter.x._value +
                        ',' +
                        this.state.topCenter.y._value +
                        ')'
                      }
                      x={this.state.topCenter.x._value - 5}
                      y={this.state.topCenter.y._value - 5}
                      fill="white"
                      strokeWidth="1"
                      stroke="#038ed6"
                    />

                    <Rect
                      width="51"
                      height="10"
                      rx="5"
                      transform={
                        'rotate(' +
                        (this.state.angleRight + 180) +
                        ',' +
                        this.state.rightCenter.x._value +
                        ',' +
                        this.state.rightCenter.y._value +
                        ')'
                      }
                      x={this.state.rightCenter.x._value - 48.5}
                      y={this.state.rightCenter.y._value - 5}
                      fill="white"
                      strokeWidth="1"
                      stroke="#038ed6"
                    />

                    <Rect
                      width="51"
                      height="10"
                      rx="5"
                      transform={
                        'rotate(' +
                        (this.state.angleBottom + 180) +
                        ',' +
                        this.state.bottomCenter.x._value +
                        ',' +
                        this.state.bottomCenter.y._value +
                        ')'
                      }
                      x={this.state.bottomCenter.x._value - 5}
                      y={this.state.bottomCenter.y._value - 5}
                      fill="white"
                      strokeWidth="1"
                      stroke="#038ed6"
                    />

                    <Rect
                      width="51"
                      height="10"
                      rx="5"
                      transform={
                        'rotate(' +
                        (this.state.angleLeft + 180) +
                        ',' +
                        this.state.leftCenter.x._value +
                        ',' +
                        this.state.leftCenter.y._value +
                        ')'
                      }
                      x={this.state.leftCenter.x._value - 48.5}
                      y={this.state.leftCenter.y._value - 5}
                      fill="white"
                      strokeWidth="1"
                      stroke="#038ed6"
                    />
                  </Svg>

                  {/*<Animated.View*/}
                  {/*    {...this.panResponderTopCenter.panHandlers}*/}
                  {/*    style={[*/}
                  {/*        {*/}
                  {/*            transform: [{rotate: (this.state.angleTop) + 'deg'}],*/}
                  {/*            marginTop: -12,*/}
                  {/*        },*/}
                  {/*        this.state.topCenter.getLayout(),*/}
                  {/*        s(this.props).handler,*/}
                  {/*    ]}*/}
                  {/*>*/}
                  {/*    <Svg*/}
                  {/*        height={10}*/}
                  {/*        width={51}*/}
                  {/*        style={{position: 'absolute', left: 0, top: 0}}*/}
                  {/*    >*/}

                  {/*    </Svg>*/}
                  {/*</Animated.View>*/}

                  {/*{this.state.showZoom === true && (*/}
                  {/*    <View style={{*/}
                  {/*        width: 60,*/}
                  {/*        height: 60,*/}
                  {/*        overflow: 'hidden',*/}
                  {/*        position: 'absolute',*/}
                  {/*        left: OFFSET_LEFT,*/}
                  {/*        top: OFFSET_TOP,*/}
                  {/*        borderWidth: 2,*/}
                  {/*        borderColor: '#038ed6',*/}
                  {/*        zIndex: 999,*/}
                  {/*        marginTop: -49,*/}
                  {/*        borderRadius: 30,*/}
                  {/*    }}>*/}
                  {/*        <Image*/}
                  {/*            style={{*/}
                  {/*                marginLeft: -OFFSET_LEFT,*/}
                  {/*                marginTop: -OFFSET_TOP,*/}
                  {/*                width: Dimensions.get('window').width,*/}
                  {/*                height: this.state.viewHeight,*/}
                  {/*            }}*/}
                  {/*            source={{uri: this.state.newImage === false ? this.state.image : `data:image/jpg;base64,${this.state.image}`}}*/}
                  {/*        />*/}
                  {/*    </View>*/}
                  {/*)}*/}

                  <Animated.View
                    hitSlop={{top: 40, bottom: 40, left: 40, right: 40}}
                    {...this.panResponderTopLeft.panHandlers}
                    style={[
                      {
                        transform: [
                          {translateX: Number(topLeft[0]) - 13},
                          {translateY: Number(topLeft[1]) - 13},
                        ],
                      },
                      s(this.props).handler,
                    ]}>
                    {/*<View*/}
                    {/*    style={[*/}
                    {/*        s(this.props).handlerRound,*/}
                    {/*        {left: 7, top: 10},*/}
                    {/*    ]}*/}
                    {/*/>*/}
                  </Animated.View>
                  <Animated.View
                    hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                    {...this.panResponderTopCenter.panHandlers}
                    style={[
                      {
                        transform: [
                          {translateX: this.state.topCenter.x._value},
                          {translateY: this.state.topCenter.y._value},
                          {rotate: this.state.angleTop + 'deg'},
                        ],
                      },
                      // this.state.topCenter.getLayout(),
                      s(this.props).handlerCenter,
                    ]}
                  />
                  <Animated.View
                    hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                    {...this.panResponderTopRight.panHandlers}
                    style={[
                      {
                        transform: [
                          {translateX: Number(topRight[0]) - 13},
                          {translateY: Number(topRight[1]) - 13},
                        ],
                      },
                      s(this.props).handler,
                    ]}>
                    {/*<View*/}
                    {/*    style={[*/}
                    {/*        s(this.props).handlerRound,*/}
                    {/*        {left: 7, top: 10},*/}
                    {/*    ]}*/}
                    {/*/>*/}
                  </Animated.View>
                  <Animated.View
                    hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                    {...this.panResponderRightCenter.panHandlers}
                    style={[
                      {
                        transform: [
                          {translateX: this.state.rightCenter.x._value},
                          {translateY: this.state.rightCenter.y._value},
                          {rotate: this.state.angleRight + 'deg'},
                        ],
                      },
                      // this.state.rightCenter.getLayout(),
                      s(this.props).handlerCenter,
                    ]}
                  />
                  <Animated.View
                    hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                    {...this.panResponderBottomRight.panHandlers}
                    style={[
                      {
                        transform: [
                          {translateX: Number(bottomRight[0]) - 13},
                          {translateY: Number(bottomRight[1]) - 13},
                        ],
                      },
                      s(this.props).handler,
                    ]}>
                    {/*<View*/}
                    {/*    style={[*/}
                    {/*        s(this.props).handlerRound,*/}
                    {/*        {left: 7, top: 10},*/}
                    {/*    ]}*/}
                    {/*/>*/}
                  </Animated.View>
                  <Animated.View
                    hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                    {...this.panResponderBottomCenter.panHandlers}
                    style={[
                      {
                        transform: [
                          {translateX: this.state.bottomCenter.x._value},
                          {translateY: this.state.bottomCenter.y._value},
                          {rotate: this.state.angleBottom + 'deg'},
                        ],
                      },
                      // this.state.bottomCenter.getLayout(),
                      s(this.props).handlerCenter,
                    ]}
                  />
                  <Animated.View
                    hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                    {...this.panResponderBottomLeft.panHandlers}
                    style={[
                      {
                        transform: [
                          {translateX: Number(bottomLeft[0]) - 13},
                          {translateY: Number(bottomLeft[1]) - 13},
                        ],
                      },
                      s(this.props).handler,
                    ]}>
                    {/*<View*/}
                    {/*    style={[*/}
                    {/*        s(this.props).handlerRound,*/}
                    {/*        {left: 7, top: 10},*/}
                    {/*    ]}*/}
                    {/*/>*/}
                  </Animated.View>
                  <Animated.View
                    hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                    {...this.panResponderLeftCenter.panHandlers}
                    style={[
                      {
                        transform: [
                          {translateX: this.state.leftCenter.x._value},
                          {translateY: this.state.leftCenter.y._value},
                          {
                            rotate: this.state.angleLeft + 'deg',
                          },
                        ],
                      },
                      // this.state.leftCenter.getLayout(),
                      s(this.props).handlerCenter,
                    ]}
                  />
                </Fragment>
              )}
          </View>

          <View
            style={{
              flexDirection: 'row-reverse',
              justifyContent: 'space-between',
              alignContent: 'flex-start',
              height: 60,
              paddingHorizontal: 22.5,
              paddingTop: 10,
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
              zIndex: 99,
            }}>
            <TouchableOpacity
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
              onPress={this.takeMorePictureFromCrop}
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}>
              <CustomIcon
                name={'take-again-photo'}
                size={35}
                color={'#ffffff'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s(this.props).bottomButton,
                {
                  alignItems: 'center',
                  alignContent: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  width: 140,
                },
              ]}
              onPress={this.slideClose}>
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: sp(17),
                  fontFamily: fonts.regular,
                }}>
                המשך ללא חיתוך
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.crop}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                borderRadius: 20,
                backgroundColor: '#00215c',
              }}>
              <CustomIcon
                style={{
                  transform: [{rotate: '180deg'}],
                  marginRight: 5,
                }}
                name={'send-photos'}
                size={18}
                color={'#ffffff'}
              />
            </TouchableOpacity>
          </View>

          {/*{this.state.newImage === false ? (*/}
          {/*    <Fragment>*/}
          {/*        <TouchableOpacity*/}
          {/*            style={[s(this.props).bottomButton,*/}
          {/*                {*/}
          {/*                    position: 'absolute',*/}
          {/*                    bottom: 30,*/}
          {/*                    right: IS_IOS ? 20 : 0,*/}
          {/*                },*/}
          {/*            ]}*/}
          {/*            onPress={this.crop}>*/}
          {/*            <Icon name={'crop'} size={20}*/}
          {/*                  color={'#ffffff'}/>*/}
          {/*        </TouchableOpacity>*/}

          {/*        <TouchableOpacity*/}
          {/*            style={[s(this.props).bottomButton,*/}
          {/*                {*/}
          {/*                    position: 'absolute',*/}
          {/*                    bottom: 30,*/}
          {/*                    left: IS_IOS ? 20 : 0,*/}
          {/*                    width: 140,*/}
          {/*                },*/}
          {/*            ]}*/}
          {/*            onPress={this.slideClose}>*/}
          {/*            <Text style={{*/}
          {/*                color: '#ffffff',*/}
          {/*                fontSize: sp(17),*/}
          {/*                fontFamily: fonts.regular,*/}
          {/*            }}>המשך ללא חיתוך</Text>*/}
          {/*        </TouchableOpacity>*/}
          {/*    </Fragment>*/}
          {/*) : (*/}
          {/*    <TouchableOpacity*/}
          {/*        style={[s(this.props).bottomButton,*/}
          {/*            {*/}
          {/*                position: 'absolute',*/}
          {/*                bottom: 30,*/}
          {/*                left: IS_IOS ? 20 : 0,*/}
          {/*            },*/}
          {/*        ]}*/}
          {/*        onPress={this.updateImage}>*/}
          {/*        <Icon name={'checkbox-multiple-marked-outline'}*/}
          {/*              size={24}*/}
          {/*              color={'#ffffff'}/>*/}
          {/*    </TouchableOpacity>*/}
          {/*)}*/}
          <Modal
            animationType="none"
            transparent
            visible={modalAlert && modalAlert.visible}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.75)',
              }}>
              <View style={modalAlert.styleWrap ? modalAlert.styleWrap : {}}>
                {modalAlert.children.header}

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row-reverse',
                    justifyContent: 'flex-start',
                    marginTop: 20,
                  }}>
                  {modalAlert.children.body}
                </View>

                {modalAlert.children.footer}
              </View>
            </View>
          </Modal>
        </View>
      </View>
    );
  }
}

// const realYTopLeftPos = this.state.originTopLeftValues.y + (gesture.dy)
// const angle = this.calculateAngle(this.state.topLeft, this.state.bottomLeft)
// const aaa = this.findNewPoint( this.state.topLeft.x._value, this.state.topLeft.y._value, angle, realYTopLeftPos)
// this.state.topLeft.setValue(aaa);
//
// const realYTopRightPos = this.state.originTopRightValues.y + (gesture.dy)
// const angle2 = this.calculateAngle(this.state.topRight, this.state.bottomRight)
// const bbb = this.findNewPoint( this.state.topRight.x._value, this.state.topRight.y._value, angle2, realYTopRightPos)
// this.state.topRight.setValue(bbb);
// this.updateOverlayString()
//
//
// const realYTopLeftPos = this.state.originTopLeftValues.y + (gesture.dy)
// const aaaa = this.calculate(this.state.topLeft, this.state.bottomLeft, realYTopLeftPos)
// const bbbb = this.calculate(this.state.topRight, this.state.bottomRight, realYTopRightPos)
// setTimeout(()=>{
//     this.state.topLeft.setValue(aaaa);
//     this.state.topRight.setValue(bbbb);
//     this.updateOverlayString()
// }, 800)
