import React from 'react';
import {
     Pressable,
     StyleSheet,
     ViewStyle,
} from 'react-native';
import Animated, {
     SharedValue,
     interpolate,
     interpolateColor,
     useAnimatedStyle,
     useSharedValue,
     withTiming,
} from 'react-native-reanimated';

interface CustomSwitchProps {
     value: SharedValue<boolean> | SharedValue<number>;
     onPress: () => void;
     style?: ViewStyle;
     duration?: number;
     trackColors?: { on: string; off: string };
}

const CustomSwitch = ({
     value,
     onPress,
     style,
     duration = 400,
     trackColors = { on: '#ca8282ff', off: '#fa7f7c' },
}: CustomSwitchProps) => {
     const height = useSharedValue(0);
     const width = useSharedValue(0);

     const trackAnimatedStyle = useAnimatedStyle(() => {
          const numericalValue = typeof value.value === 'boolean' ? (value.value ? 1 : 0) : value.value;
          const color = interpolateColor(
               numericalValue,
               [0, 1],
               [trackColors.off, trackColors.on]
          );
          const colorValue = withTiming(color, { duration });

          return {
               backgroundColor: colorValue,
               borderRadius: height.value / 2,
          };
     });

     const thumbAnimatedStyle = useAnimatedStyle(() => {
          const numericalValue = typeof value.value === 'boolean' ? (value.value ? 1 : 0) : value.value;
          const moveValue = interpolate(
               numericalValue,
               [0, 1],
               [0, width.value - height.value]
          );
          const translateValue = withTiming(moveValue, { duration });

          return {
               transform: [{ translateX: translateValue }],
               borderRadius: height.value / 2,
          };
     });

     return (
          <Pressable onPress={onPress}>
               <Animated.View
                    onLayout={(e) => {
                         height.value = e.nativeEvent.layout.height;
                         width.value = e.nativeEvent.layout.width;
                    }}
                    style={[switchStyles.track, style, trackAnimatedStyle]}>
                    <Animated.View
                         style={[switchStyles.thumb, thumbAnimatedStyle]}></Animated.View>
               </Animated.View>
          </Pressable>
     );
};

const switchStyles = StyleSheet.create({
     track: {
          alignItems: 'flex-start',
          width: 50,
          height: 28,
          padding: 3,
     },
     thumb: {
          height: '100%',
          aspectRatio: 1,
          backgroundColor: 'white',
     },
});

export default CustomSwitch;
