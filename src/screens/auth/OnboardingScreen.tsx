import CustomButton from '@/components/CustomButton';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { Image } from "expo-image";
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
     Dimensions,
     FlatList,
     ImageBackground,
     NativeScrollEvent,
     NativeSyntheticEvent,
     Pressable,
     StatusBar,
     StyleSheet,
     Text,
     TouchableOpacity,
     View
} from 'react-native';
import { PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from 'react-native-safe-area-context';

interface SlideData {
     readonly id: string;
     readonly image: number;
     readonly title: string;
     readonly subtitle: string;
}

interface SlideProps {
     readonly item: SlideData;
}

const { width, height } = Dimensions.get('window');

const COLORS: Record<string, string> = {
     primary: '#FF803E',
     white: '#fff',
     indicatorInactive: '#888',
};

const SLIDES: readonly SlideData[] = [
     {
          id: '1',
          image: require('../../assets/images/image1.png'),
          title: 'Bienvenidos',
          subtitle: 'Organiza tus compras de manera fácil y rápida',
     },
     {
          id: '2',
          image: require('../../assets/images/image2.png'),
          title: 'No importa si olvidas algo',
          subtitle: 'Tu lista siempre disponible en tu bolsillo',
     },
     {
          id: '3',
          image: require('../../assets/images/image3.png'),
          title: 'Organiza tus compras',
          subtitle: 'Asi evitas comprar de mas',
     },
     {
          id: '4',
          image: require('../../assets/images/image4.png'),
          title: 'Tranquilidad y comodidad',
          subtitle: 'Sientete seguro/a de que no vas a olvidar nada',
     },
];

const OnboardingSlide = ({ item }: SlideProps): React.ReactElement => {
     if (item.id === '1') {
          return (
               <ImageBackground
                    source={require('../../assets/images/image1.png')}
                    style={styles.backgroundImage}
                    resizeMode="cover"
               >
                    <View style={styles.textContainer}>
                         <Image
                              source={require('../../assets/SVGs/logo.svg')}
                              style={{ width: 200, height: 50, marginRight: -20 }}
                              contentFit="cover"
                         />
                         <View style={{ paddingBottom: 60 }} />
                         <Text style={item.id === '1' ? styles.mainTitle : styles.title}>{item.title}</Text>
                         <Text style={item.id === '1' ? styles.mainSubtitle : styles.subtitle}>{item.subtitle}</Text>
                    </View>
               </ImageBackground>
          );
     }

     return (
          <View style={styles.slideContainer}>
               <Image
                    source={require("../../assets/SVGs/logo.svg")}
                    style={styles.logo}
                    contentFit="contain"
               />
               <Image
                    source={item.image}
                    style={styles.image}
                    contentFit="contain"
               />
               <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
               </View>
          </View>
     );
};

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
                    color: COLORS.primary,
                    gradientCenterColor: COLORS.primary,
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
                         color: COLORS.primary,
                         gradientCenterColor: COLORS.primary,
                         focused: true,
                    },
                    { value: remainingPercentage, color: '#e0e0e0', gradientCenterColor: '#e0e0e0' },
               ]);
          }
     };

     const handleGetStarted = async (): Promise<void> => {
          try {
               await AsyncStorage.setItem('onboarding_seen', 'true');
          } catch (e) {
               console.error('Error saving onboarding status:', e);
          }
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
                         <CustomButton
                              title="COMENZAR"
                              onPress={handleGetStarted}
                              style={{ flex: 1 }}
                         />
                    </View>
               );
          }

          return (
               <View style={styles.buttonRow}>
                    <TouchableOpacity
                         onPress={handleGetStarted}
                         activeOpacity={0.8}
                    >
                         <Text style={styles.buttonBase}>Saltar</Text>
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
                                        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: '100%', padding: 6 }}>
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
          <OnboardingSlide item={item} />
     );

     const keyExtractor = (item: SlideData): string => item.id;


     return (
          <View style={{ flex: 1 }}>
               <SafeAreaView style={styles.container}>
                    <StatusBar translucent backgroundColor="transparent" />
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
          </View>
     );
};

const styles = StyleSheet.create({
     container: {
          flex: 1,
          backgroundColor: COLORS.white,
          marginTop: -40,
     },
     logo: {
          width: 200,
          height: 50,
     },
     slideContainer: {
          width,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 100,
     },
     backgroundImage: {
          width,
          height,
          justifyContent: 'center',
     },
     image: {
          height: height * 0.45,
          width: width * 0.8,
     },
     textContainer: {
          paddingHorizontal: 20,
          paddingTop: 20,
          marginBottom: -40,
          flexDirection: 'column',
          alignItems: 'flex-end',
     },
     mainTitle: {
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'right',
     },
     title: {
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
     },
     mainSubtitle: {
          fontSize: 14,
          textAlign: 'right',
          opacity: 0.8,
          lineHeight: 22,
          marginLeft: 120,
          height: 50,
          wordWrap: 'break-word',
     },
     subtitle: {
          fontSize: 14,
          textAlign: 'center',
          opacity: 0.8,
          lineHeight: 22,
     },
     footer: {
          height: height * 0.15,
          justifyContent: 'space-between',
          paddingHorizontal: 20,
     },
     indicatorContainer: {
          flexDirection: 'row',
          justifyContent: 'center',
     },
     indicator: {
          height: 6,
          width: 8,
          backgroundColor: COLORS.indicatorInactive,
          marginHorizontal: 4,
          borderRadius: 4,
     },
     indicatorActive: {
          backgroundColor: COLORS.primary,
          width: 15,
     },
     buttonRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
     },
     primaryButton: {
          flex: 1,
          height: 50,
          borderRadius: 50,
          shadowColor: COLORS.primary,
          shadowOffset: {
               width: 0,
               height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          backgroundColor: COLORS.primary,
          justifyContent: 'center',
          alignItems: 'center',
     },
     buttonBase: {
          fontWeight: 'bold',
          fontSize: 15,
     },
     buttonSpacer: {
          width: 15,
     },
     flatListContent: {
          height: height * 0.75,
     },
});

export default OnboardingScreen;
