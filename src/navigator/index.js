import React, {PureComponent} from 'react';
import {Dimensions} from 'react-native';
import {connect} from 'react-redux';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  CardStyleInterpolators,
  createStackNavigator,
  HeaderStyleInterpolators,
} from '@react-navigation/stack';
import {setGlobalParams} from 'src/redux/actions/user';
import SplashScreen from 'react-native-splash-screen';
import {
  ARCHIVES,
  BANK_ACCOUNTS,
  BANK_MATCH,
  BUDGET,
  CASH_FLOW,
  CHECKS,
  CREDIT_CARD,
  CYCLIC_TRANS,
  GOT_ABSORBED,
  HELP,
  LANDING,
  LOGIN,
  MAIN,
  MESSAGES,
  MUTAVIM,
  OVERVIEW,
  PACKAGES,
  RECOMMENDATION,
  SETTINGS,
  SIGNUP,
  SLIKA,
  UPLOADING_DOCUMENTS,
  WAITING_ABSORBED,
} from '../constants/navigation';
import {indexNav} from '../screens';
import Drawer from '../components/Drawer/Drawer';
import HeaderLeft from '../components/Header/HeaderLeft';
import HeaderRight from '../components/Header/HeaderRight';
import HeaderTitle from '../components/Header/HeaderTitle';
import Recommendation from '../components/Recommendation/Recommendation';
// import {withTranslation} from 'react-i18next';

const {
  BankAccountsScreen,
  BankMatchScreen,
  CashFlowScreen,
  ChecksScreen,
  CreditCardsScreen,
  CyclicTransScreen,
  LandingScreen,
  LoginScreen,
  MessagesScreen,
  OverviewScreen,
  SettingsScreen,
  SignupScreen,
  SlikaScreen,
  HelpScreen,
  MutavimScreen,
  PackagesScreen,
  BudgetScreen,
  UploadingDocumentsScreen,
  ArchivesScreen,
  WaitingAndGotAbsorbedScreen,
  // CameraScreen,
} = indexNav;
const Drawers = createDrawerNavigator();
const Stack = createStackNavigator();

// const CameraPage = (props) => {
//     return <CameraScreen {...props}/>
// }
const Login = props => {
  return <LoginScreen {...props} />;
};
const Overview = props => {
  return <OverviewScreen {...props} />;
};
const Landing = props => {
  return <LandingScreen {...props} />;
};
const BankAccounts = props => {
  return <BankAccountsScreen {...props} />;
};
const CreditCards = props => {
  return <CreditCardsScreen {...props} />;
};
const Slika = props => {
  return <SlikaScreen {...props} />;
};
const CashFlow = props => {
  return <CashFlowScreen {...props} />;
};
const Mutavim = props => {
  return <MutavimScreen {...props} />;
};
const Checks = props => {
  return <ChecksScreen {...props} />;
};
const CyclicTrans = props => {
  return <CyclicTransScreen {...props} />;
};
const BankMatch = props => {
  return <BankMatchScreen {...props} />;
};
const Settings = props => {
  return <SettingsScreen {...props} />;
};
const Messages = props => {
  return <MessagesScreen {...props} />;
};
const Recommendations = props => {
  return <Recommendation {...props} />;
};
const Help = props => {
  return <HelpScreen {...props} />;
};
const UploadingDocuments = props => {
  return <UploadingDocumentsScreen {...props} />;
};
const Archives = props => {
  return <ArchivesScreen {...props} />;
};
const WaitingAndGotAbsorbed = props => {
  return <WaitingAndGotAbsorbedScreen {...props} />;
};
const Packages = props => {
  return <PackagesScreen {...props} />;
};
const Budget = props => {
  return <BudgetScreen {...props} />;
};
const Signup = props => {
  return <SignupScreen {...props} />;
};
const getActiveRouteName = state => {
  const route = state.routes[state?.index || 0];

  if (route.state) {
    // Dive into nested navigators
    return getActiveRouteName(route.state);
  }

  return route.name;
};

@connect(state => ({
  isRtl: state.isRtl,
  openedBottomSheet: state.openedBottomSheet,
  globalParams: state.globalParams,
}))
export class AppDrawer extends PureComponent {
  componentDidMount() {
    SplashScreen.hide();
  }

  render() {
    const main_props = this.props;
    return (
      <NavigationContainer
        onStateChange={state => {
          if (!state) {
            return;
          }
          //@ts-ignore
          const current = getActiveRouteName(state);
          main_props.dispatch(
            setGlobalParams(
              Object.assign(main_props.globalParams, {
                currentState: current,
              }),
            ),
          );
        }}>
        <Drawers.Navigator
          drawerWidth={() => {
            const {width} = Dimensions.get('window');
            return width - 53;
          }}
          drawerContent={props => <Drawer {...props} {...main_props} />}
          screenOptions={{
            drawerPosition: main_props.isRtl ? 'right' : 'left',
            headerShown: false,
          }}
          drawerPosition={main_props.isRtl ? 'right' : 'left'}
          backBehavior="initialRoute">
          <Stack.Screen
            name={MAIN}
            options={{
              swipeEnabled: false,
              gestureEnabled: true,
            }}>
            {() => (
              <Stack.Navigator
                initialRouteName={LOGIN}
                // initialRouteName={'CAMERA'}
                backBehavior="initialRoute"
                screenOptions={prop => {
                  const drawerLockMode =
                    prop.route.name !== 'LOGIN' ? 'unlocked' : 'locked-closed';

                  const {openedBottomSheet} = main_props;
                  return {
                    headerMode: 'screen',
                    cardStyleInterpolator:
                      CardStyleInterpolators.forNoAnimation,
                    headerStyle: {
                      backgroundColor: openedBottomSheet
                        ? '#000000cc'
                        : '#ffffff',
                      opacity: openedBottomSheet ? 0.8 : 1,
                    },
                    headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
                    headerTintColor: '#fff',
                    drawerLockMode,
                    headerTitleContainerStyle: {
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    },
                    headerTitleStyle: {
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    },
                    headerBackgroundContainerStyle: openedBottomSheet
                      ? '#000000cc'
                      : '#ffffff',
                    headerLeft: props => <HeaderLeft {...prop} {...props} />,
                    headerRight: props => <HeaderRight {...prop} {...props} />,
                    headerTitle: props => <HeaderTitle {...prop} {...props} />,
                    headerTitleAlign: 'center',
                  };
                }}>
                {/*<Stack.Screen*/}
                {/*    name={'CAMERA'}*/}
                {/*    options={{*/}
                {/*        headerShown: false,*/}
                {/*        drawerLockMode: 'locked-closed',*/}
                {/*        gesturesEnabled: false,*/}
                {/*    }}*/}
                {/*    component={CameraPage}*/}
                {/*/>*/}
                <Stack.Screen
                  name={LOGIN}
                  options={{
                    headerShown: false,
                    drawerLockMode: 'locked-closed',
                    gesturesEnabled: false,
                  }}
                  component={Login}
                />
                <Stack.Screen name={OVERVIEW} component={Overview} />
                <Stack.Screen name={LANDING} component={Landing} />
                <Stack.Screen name={BANK_ACCOUNTS} component={BankAccounts} />
                <Stack.Screen name={CREDIT_CARD} component={CreditCards} />
                <Stack.Screen name={SLIKA} component={Slika} />
                <Stack.Screen name={CASH_FLOW} component={CashFlow} />
                <Stack.Screen name={MUTAVIM} component={Mutavim} />
                <Stack.Screen name={CHECKS} component={Checks} />
                <Stack.Screen name={CYCLIC_TRANS} component={CyclicTrans} />
                <Stack.Screen name={BANK_MATCH} component={BankMatch} />
                <Stack.Screen name={SETTINGS} component={Settings} />
                <Stack.Screen name={MESSAGES} component={Messages} />
                <Stack.Screen
                  name={RECOMMENDATION}
                  component={Recommendations}
                  options={prop => {
                    return {
                      cardStyleInterpolator:
                        CardStyleInterpolators.forHorizontalIOS,
                      headerStyle: {
                        backgroundColor: '#022258',
                      },
                      headerTintColor: '#fff',
                      headerTitleStyle: {
                        fontWeight: 'bold',
                      },
                      headerLeft: null,
                      headerRight: props => (
                        <HeaderRight isModal {...prop} {...props} />
                      ),
                      headerTitle: props => (
                        <HeaderTitle showTitle {...prop} {...props} />
                      ),
                    };
                  }}
                />
                <Stack.Screen name={HELP} component={Help} />
                <Stack.Screen
                  name={UPLOADING_DOCUMENTS}
                  options={{gestureEnabled: false}}
                  component={UploadingDocuments}
                />
                <Stack.Screen name={ARCHIVES} component={Archives} />
                <Stack.Screen
                  name={GOT_ABSORBED}
                  component={WaitingAndGotAbsorbed}
                />
                <Stack.Screen
                  name={WAITING_ABSORBED}
                  component={WaitingAndGotAbsorbed}
                />
                <Stack.Screen name={PACKAGES} component={Packages} />
                <Stack.Screen name={BUDGET} component={Budget} />
                <Stack.Screen
                  name={SIGNUP}
                  component={Signup}
                  options={{
                    headerShown: false,
                    drawerLockMode: 'locked-closed',
                    gesturesEnabled: false,
                  }}
                />
              </Stack.Navigator>
            )}
          </Stack.Screen>
        </Drawers.Navigator>
      </NavigationContainer>
    );
  }
}
