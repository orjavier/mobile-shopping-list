import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
     Dimensions,
     FlatList,
     Image,
     ImageStyle,
     NativeScrollEvent,
     NativeSyntheticEvent,
     Pressable,
     SafeAreaView,
     StatusBar,
     StyleSheet,
     Text,
     TextStyle,
     TouchableOpacity,
     View,
     ViewStyle,
} from 'react-native';
import { PieChart } from "react-native-gifted-charts";



interface SlideData {
     readonly id: string;
     readonly image: number;
     readonly title: string;
     readonly subtitle: string;
}

interface SlideProps {
     readonly item: SlideData;
}

interface OnboardingNavigation {
     replace(screen: string): void;
}

interface OnboardingProps {
     readonly navigation: OnboardingNavigation;
}

const { width, height } = Dimensions.get('window');

const COLORS: Record<string, string> = {
     primary: '#282534',
     white: '#fff',
     indicatorInactive: '#888',
};

const SLIDES: readonly SlideData[] = [
     {
          id: '1',
          image: require('../../assets/images/image1.png'),
          title: 'Gestiona tus listas',
          subtitle: 'Organiza tus compras de manera fácil y rápida',
     },
     {
          id: '2',
          image: require('../../assets/images/image2.png'),
          title: 'Comparte con familia',
          subtitle: 'Comparte tus listas con quienes quieras',
     },
     {
          id: '3',
          image: require('../../assets/images/image3.png'),
          title: 'Nunca olvidas nada',
          subtitle: 'Tu lista siempre disponible en tu bolsillo',
     },
     {
          id: '4',
          image: require('../../assets/images/image4.png'),
          title: 'Nunca olvidas nada',
          subtitle: 'Tu lista siempre disponible en tu bolsillo',
     },
     {
          id: '5',
          image: require('../../assets/images/image5.png'),
          title: 'Nunca olvidas nada',
          subtitle: 'Tu lista siempre disponible en tu bolsillo',
     },
];

const Slide = ({ item }: SlideProps): React.ReactElement => (
     <View style={styles.slideContainer}>
          <Image
               source={item.image}
               style={styles.image}
               resizeMode="contain"
          />
          <View style={styles.textContainer}>
               <Text style={styles.title}>{item.title}</Text>
               <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
     </View>
);

interface PieChartData {
     value: number;
     color: string;
     gradientCenterColor: string;
     focused?: boolean;
}

const OnboardingScreen = (): React.ReactElement => {
     const router = useRouter();
     const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
     const flatListRef = useRef<FlatList<SlideData>>(null);
     const [pieData, setPieData] = useState<PieChartData[]>([]);

     const calculatePercentage = (index: number): number => {
          return ((index + 1) / SLIDES.length) * 100;
     };

     useEffect(() => {
          updatePieData(currentSlideIndex);
     }, []);

     const updatePieData = (index: number): void => {
          const percentage = calculatePercentage(index);
          const remainingPercentage = 100 - percentage;
          setPieData([
               {
                    value: percentage,
                    color: '#009FFF',
                    gradientCenterColor: '#006DFF',
                    focused: true,
               },
               { value: remainingPercentage, color: '#e0e0e0', gradientCenterColor: '#e0e0e0' },
          ]);
     };

     const updateCurrentSlideIndex = (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
          const contentOffsetX = e.nativeEvent.contentOffset.x;
          const currentIndex = Math.round(contentOffsetX / width);
          setCurrentSlideIndex(currentIndex);
          updatePieData(currentIndex);
     };

     const goToNextSlide = (): void => {
          const nextSlideIndex = currentSlideIndex + 1;
          if (nextSlideIndex < SLIDES.length) {
               const offset = nextSlideIndex * width;
               flatListRef.current?.scrollToOffset({ offset });
               setCurrentSlideIndex(nextSlideIndex);
               const percentage = calculatePercentage(nextSlideIndex);
               const remainingPercentage = 100 - percentage;
               setPieData([
                    {
                         value: percentage,
                         color: '#009FFF',
                         gradientCenterColor: '#006DFF',
                         focused: true,
                    },
                    { value: remainingPercentage, color: '#e0e0e0', gradientCenterColor: '#e0e0e0' },
               ]);
          }
     };

     const skip = (): void => {
          const lastSlideIndex = SLIDES.length - 1;
          const offset = lastSlideIndex * width;
          flatListRef.current?.scrollToOffset({ offset });
          setCurrentSlideIndex(lastSlideIndex);
     };

     const handleGetStarted = (): void => {
          router.replace('/login');
     };

     const renderIndicators = (): React.ReactElement => (
          <View style={styles.indicatorContainer}>
               {SLIDES.map((_, index) => (
                    <View
                         key={index}
                         style={[
                              styles.indicator,
                              currentSlideIndex === index && styles.indicatorActive,
                         ]}
                    />
               ))}
          </View>
     );

     const renderButtons = (): React.ReactElement => {
          const isLastSlide = currentSlideIndex === SLIDES.length - 1;

          if (isLastSlide) {
               return (
                    <View style={styles.buttonRow}>
                         <TouchableOpacity
                              style={styles.primaryButton}
                              onPress={handleGetStarted}
                              activeOpacity={0.8}
                         >
                              <Text style={styles.primaryButtonText}>COMENZAR</Text>
                         </TouchableOpacity></View>
               );
          }

          return (
               <View style={styles.buttonRow}>
                    <TouchableOpacity
                         onPress={handleGetStarted}
                         activeOpacity={0.8}
                    >
                         <Text style={styles.primaryButtonText}>Saltar</Text>
                    </TouchableOpacity>
                    <View style={styles.buttonSpacer} />
                    <View style={{ padding: 5, alignItems: 'center', }}>
                         <PieChart
                              data={pieData}
                              isAnimated={true}
                              donut
                              radius={30}
                              innerRadius={28}
                              centerLabelComponent={() => {
                                   return (
                                        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#006DFF', borderRadius: '100%', padding: 6 }}>
                                             <Pressable onPress={goToNextSlide}>
                                                  <MaterialIcons name="arrow-forward" size={30} color="#fff" />
                                             </Pressable>
                                        </View>
                                   );
                              }}
                         />
                    </View>
               </View>
          );
     };

     const renderFooter = (): React.ReactElement => (
          <View style={styles.footer}>
               {renderIndicators()}
               {renderButtons()}
          </View>
     );

     const renderItem = ({ item }: { item: SlideData }): React.ReactElement => (
          <Slide item={item} />
     );

     const keyExtractor = (item: SlideData): string => item.id;


     return (
          <SafeAreaView style={styles.container}>
               <StatusBar backgroundColor={'transparent'} barStyle="light-content" />
               <FlatList
                    ref={flatListRef}
                    data={SLIDES}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={updateCurrentSlideIndex}
                    contentContainerStyle={styles.flatListContent}
               />
               {renderFooter()}
          </SafeAreaView>
     );
};

interface Styles {
     container: ViewStyle;
     slideContainer: ViewStyle;
     image: ImageStyle;
     textContainer: ViewStyle;
     title: TextStyle;
     subtitle: TextStyle;
     footer: ViewStyle;
     indicatorContainer: ViewStyle;
     indicator: ViewStyle;
     indicatorActive: ViewStyle;
     buttonRow: ViewStyle;
     primaryButton: ViewStyle;
     primaryButtonText: TextStyle;
     secondaryButton: ViewStyle;
     secondaryButtonText: TextStyle;
     buttonSpacer: ViewStyle;
     flatListContent: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
     container: {
          flex: 1,
          backgroundColor: COLORS.white,
          //marginBottom: 5,
     },
     slideContainer: {
          width,
          alignItems: 'center',
          justifyContent: 'center',
     },
     image: {
          height: height * 0.5,
          width: width * 0.8,
     },
     textContainer: {
          alignItems: 'center',
          paddingHorizontal: 20,
     },
     title: {
          color: COLORS.primary,
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 10,
     },
     subtitle: {
          color: COLORS.primary,
          fontSize: 14,
          textAlign: 'center',
          opacity: 0.8,
          lineHeight: 22,
     },
     footer: {
          height: height * 0.25,
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingBottom: 20,
     },
     indicatorContainer: {
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 20,
     },
     indicator: {
          height: 6,
          width: 12,
          backgroundColor: COLORS.indicatorInactive,
          marginHorizontal: 4,
          borderRadius: 4,
     },
     indicatorActive: {
          backgroundColor: COLORS.primary,
          width: 25,
     },
     buttonRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
     },
     primaryButton: {
          flex: 1,
          height: 50,
          borderRadius: 8,
          backgroundColor: 'red',//COLORS.white,
          justifyContent: 'center',
          alignItems: 'center',
     },
     primaryButtonText: {
          fontWeight: 'bold',
          fontSize: 15,
          color: COLORS.primary,
     },
     secondaryButton: {
          flex: 1,
          height: 50,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: COLORS.primary,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
     },
     secondaryButtonText: {
          fontWeight: 'bold',
          fontSize: 15,
          color: COLORS.primary,
     },
     buttonSpacer: {
          width: 15,
     },
     flatListContent: {
          height: height * 0.75,
     },
});

export default OnboardingScreen;
