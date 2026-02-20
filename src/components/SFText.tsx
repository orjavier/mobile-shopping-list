import { Text, TextProps } from './Themed';

export function SFText(props: TextProps) {
     return <Text {...props} style={[props.style, { fontFamily: 'SF' }]} />;
}
