import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AntDesign } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { weatherImages } from '@/constants';
import * as Progress from 'react-native-progress';
import { getData, storeData } from '../utils/asyncStorage';

const theme = {
  bgWhite: (opacity) => `rgba(255, 255, 255, ${opacity})`,
};
const android = Platform.OS == 'android';
export default function Index() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLocation = (loc) => {
    setLoading(true);
    setLocations([]);
    toggleSearch(false);
    fetchWeatherForecast({ cityName: loc.name, days: '7' }).then((data) => {
      setWeather(data);
      setLoading(false);
      storeData('city', loc.name);
    });
  };

  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data) => {
        setLocations(data);
      });
    }
  };
  const handleTextDebounce = useCallback(debounce(handleSearch, 1000), []);

  const { current, location } = weather;

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    const data = await getData('city');
    let cityName = 'Surat';
    if (data) cityName = data;
    setLoading(true);
    fetchWeatherForecast({ cityName, days: '7' }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };

  return (
    <View className="flex-1 relative">
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require('../assets/images/bg.jpg')}
        className="absolute h-full w-full"
      />
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Progress.CircleSnail color={'yellow'} thickness={10} size={100} />
        </View>
      ) : (
        <SafeAreaView
          className="flex flex-1"
          style={{ paddingTop: android ? 50 : '' }}
        >
          <View style={{ height: 70 }} className="mx-4 relative z-50">
            <View
              className="flex-row justify-end items-center rounded-full"
              style={{
                backgroundColor: showSearch
                  ? theme.bgWhite(0.2)
                  : 'transparent',
              }}
            >
              {showSearch && (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search city"
                  placeholderTextColor={'wheat'}
                  className="pl-6 h-10 pb-1 flex-1 text-base text-white"
                />
              )}

              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                style={{ backgroundColor: theme.bgWhite(0.3) }}
                className="rounded-full p-3 m-1"
              >
                <AntDesign
                  name="search1"
                  size={20}
                  color="white"
                  style={{ alignSelf: 'center' }}
                />
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                {locations?.map((loc, index) => {
                  let showBorder = index + 1 != locations.length;
                  let borderClass = showBorder
                    ? 'border-b-2 border-b-gray-400'
                    : '';
                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(loc)}
                      className={
                        'flex-row items-center border-0 p-3 px-4 mb-1 ' +
                        borderClass
                      }
                      key={index}
                    >
                      <MaterialCommunityIcons
                        name="map-marker-radius"
                        size={24}
                        color="gray"
                      />
                      <Text className="text-black text-lg ml-2">
                        {loc?.name}, {loc?.region}, {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          <View className="flex flex-1 mx-4 justify-around mb-2">
            <Text className="text-white text-center text-2xl font-bold">
              {location?.name},
              <Text className="text-lg font-semibold text-gray-300">
                {' ' + location?.country}
              </Text>
            </Text>
            <View className="flex-row justify-center">
              <Image
                source={weatherImages[current?.condition?.text]}
                // source={{ uri: 'http:' + current?.condition?.icon }}
                className="w-52 h-52"
              />
            </View>
            <View className="space-y-2">
              <Text className="text-center font-bold text-white text-6xl ml-5">
                {current?.temp_c}&#176;
              </Text>
              <Text className="text-center text-white text-xl tracking-widest">
                {current?.condition?.text}
              </Text>
            </View>

            <View className="flex-row justify-between mx-4">
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require('../assets/images/wind.png')}
                  className="h-6 w-6"
                />
                <Text className="text-white font-semibold text-base">
                  {current?.wind_kph}km
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require('../assets/images/drop.png')}
                  className="h-6 w-6"
                />
                <Text className="text-white font-semibold text-base">
                  {current?.humidity}%
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require('../assets/images/sun copy.png')}
                  className="h-6 w-6"
                />
                <Text className="text-white font-semibold text-base">
                  {weather?.forecast?.forecastday[0].astro.sunrise}
                </Text>
              </View>
            </View>
            {!showSearch && (
              <View className="mb-2 space-y-3">
                <View className="flex-row items-center  mx-5 space-x-2">
                  <AntDesign name="calendar" size={22} color="white" />
                  <Text className="text-white text-base">Daily forecast</Text>
                </View>
                <ScrollView
                  horizontal
                  contentContainerStyle={{ paddingHorizontal: 15 }}
                  showsHorizontalScrollIndicator={false}
                >
                  {weather?.forecast?.forecastday?.map((item, index) => {
                    let date = new Date(item?.date);
                    let option = { weekday: 'long' };
                    let dayName = date.toLocaleDateString('en-US', option);
                    return (
                      <View
                        key={index}
                        style={{ backgroundColor: theme.bgWhite(0.15) }}
                        className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                      >
                        <Image
                          // source={weatherImages[item?.day?.condition?.text]}
                          source={{ uri: 'http:' + item?.day?.condition?.icon }}
                          className="h-11 w-11"
                        />
                        <Text className="text-white">{dayName}</Text>
                        <Text className="text-white text-xl font-semibold">
                          {item?.day?.avgtemp_c}&#176;
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
