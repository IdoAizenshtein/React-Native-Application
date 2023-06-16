import React, { PureComponent } from "react";
import { Dimensions, Image, Modal, TouchableOpacity, View } from "react-native";
import "react-native-gesture-handler";
import { isIphoneX } from "react-native-iphone-x-helper";
import ImageZoom from "react-native-image-pan-zoom";
import CustomIcon from "../Icons/Fontello";
import { colors } from "../../styles/vars";
import styles from "./ImgPreviewModalStyles";
import Loader from "../Loader/Loader";
import { HeaderHeightContext, useHeaderHeight } from "@react-navigation/elements";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const window = Dimensions.get("window");

export default class ImgPreviewModal extends PureComponent {
  state = { isReady: false, width: window.width, height: window.height };
  headerHeight = 0;

  handleRequestClose = () => null;

  componentDidMount() {
    const { image } = this.props;
    if (!image) {
      return;
    }
    Image.getSize(this.props.image, (width, height) => {
      const ratio = (window.height - this.headerHeight) / width;

      this.setState({
        width: window.height - this.headerHeight - (isIphoneX() ? 25 : 0),
        height: height * ratio,
        isReady: true,
      });
    });
  }

  render() {
    const { isOpen, image, onClose } = this.props;
    const { width, height, isReady } = this.state;

    if (!image) {
      return null;
    }
    if (!isReady) {
      return <Loader overlay isDefault />;
    }

    return (
      <Modal
        visible={isOpen}
        onRequestClose={this.handleRequestClose}>
        <HeaderHeightContext.Consumer>
          {headerHeight => {
            this.headerHeight = headerHeight;
          }}
        </HeaderHeightContext.Consumer>
        <SafeAreaProvider>

          <SafeAreaView style={{ flex: 1, position: "relative" }}>
            <View style={{ backgroundColor: "black" }}>
              <TouchableOpacity
                style={styles.closeBtn} onPress={onClose}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <CustomIcon name="times" size={20} color={colors.blue19} />
              </TouchableOpacity>

              <ImageZoom
                enableCenterFocus={false}
                cropWidth={window.width}
                cropHeight={window.height}
                imageWidth={height}
                imageHeight={width}
                centerOn={{
                  x: height > window.width ? -(height / 2) + window.width / 2 : 0,
                  y: 0,
                  scale: 1,
                  duration: 1,
                }}
              >
                <View style={{
                  width: "100%",
                  height: "100%",
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Image
                    style={
                      {
                        width,
                        height,
                        transform: [{ rotate: "90deg" }],
                      }
                    }
                    source={{ uri: image }}
                  />
                </View>
              </ImageZoom>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    );
  }
}
