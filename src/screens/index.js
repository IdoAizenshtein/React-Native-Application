import LoginScreen from './LoginScreen/LoginScreen'
import LandingScreen from './LandingScreen/LandingScreen'
import BankAccountsScreen from './BankAccountsScreen/BankAccountsScreen'
import CreditCardsScreen from './CreditCardsScreen/CreditCardsScreen'
import CashFlowScreen from './CashFlowScreen/CashFlowScreen'
import ChecksScreen from './ChecksScreen/ChecksScreen'
import BankMatchScreen from './BankMatchScreen/BankMatchScreen'
import SlikaScreen from './SlikaScreen/SlikaScreen'
import SettingsScreen from './SettingsScreen/SettingsScreen'
import OverviewScreen from './OverviewScreen/OverviewScreen'
import CyclicTransScreen from './CyclicTransScreen/CyclicTransScreen'
import MessagesScreen from './MessagesScreen/MessagesScreen'
import HelpScreen from './HelpScreen/HelpScreen'
import MutavimScreen from './MutavimScreen/MutavimScreen'
import PackagesScreen from './PackagesScreen/PackagesScreen'
import SignupScreen from './SignupScreen/SignupScreen'
import BudgetScreen from './BudgetScreen/BudgetScreen'
import UploadingDocumentsScreen
  from './DocumentManagement/UploadingDocumentsScreen/UploadingDocumentsScreen'
import ArchivesScreen from './DocumentManagement/Archives/ArchivesScreen'
import WaitingAndGotAbsorbedScreen
  from './DocumentManagement/WaitingAndGotAbsorbed/WaitingAndGotAbsorbedScreen'
// import CameraScreen from './Camera/Camera'

export const indexNav = {
  LoginScreen,
  LandingScreen,
  BankAccountsScreen,
  CreditCardsScreen,
  CashFlowScreen,
  ChecksScreen,
  BankMatchScreen,
  SlikaScreen,
  SettingsScreen,
  OverviewScreen,
  CyclicTransScreen,
  MessagesScreen,
  SignupScreen,
  HelpScreen,
  MutavimScreen,
  PackagesScreen,
  BudgetScreen,
  UploadingDocumentsScreen,
  ArchivesScreen,
  WaitingAndGotAbsorbedScreen,
  // CameraScreen,
}
import {NativeModules} from 'react-native'
console.log('NativeModules: ', NativeModules || {})
