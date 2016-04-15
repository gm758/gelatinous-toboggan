import { mdl } from 'react-native-material-kit';
import { login, colors } from '../assets/styles';

const EmailInput = mdl.Textfield.textfield()
  .withAutoCorrect(false)
  .withStyle(login.textfield)
  .withUnderlineSize(2)
  .withHighlightColor(colors.auburn)
  .withTintColor(colors.auburn)
  .withTextInputStyle(login.textInput)
  .withKeyboardType('email-address')
  .build();

export default EmailInput;
