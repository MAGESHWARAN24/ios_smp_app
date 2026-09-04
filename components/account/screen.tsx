import { useThemedStyles } from '@/lib/useThemedStyles';
import type { FC } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import LogoutBtn from './logout-btn';
import PresetNavigation from './preset-navigations';
import ProfileCard from './profile-card';

interface AccountScreenProps { }

const styles = StyleSheet.create({
    container: {
        paddingBottom: 50,
        paddingVertical: 15,
        paddingHorizontal: 15
    }
})

const AccountScreen: FC<AccountScreenProps> = () =>
{
    const appTheme = useThemedStyles()
    return (
        <ScrollView style={[appTheme.styles.screen, styles.container]}>
            <ProfileCard />
            <PresetNavigation />
            <LogoutBtn />
        </ScrollView>
    );
}

export default AccountScreen;
