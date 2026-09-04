import { useAuth } from "@/components/auth/config";
import { CMYK } from "@/lib/theme";
import { useThemedStyles } from "@/lib/useThemedStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import type { FC } from 'react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import z from 'zod';
import AppLogo from "../common/app-logo";
import Input from '../ui/input';

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormSchemaType = z.infer<typeof formSchema>

interface DMLFormProps { }

const styles = StyleSheet.create({
    container: {
        gap: 20
    },
    header: {
        gap: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.7,
    },
    button: {
        height: 50,
        width: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonLabel: {
        fontSize: 20
    },
    controllerContainer: {
        gap: 8
    },
    label: {
        fontSize: 15,
        fontWeight: "bold"
    },
    error: {
        fontSize: 12,
        fontWeight: "bold"
    },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    leftIcon: {
        position: 'absolute',
        left: 14,
        zIndex: 1,
    },
    rightIcon: {
        position: 'absolute',
        right: 14,
        zIndex: 1,
    },
    inputWithLeftIcon: {
        paddingLeft: 42,
    },
    inputWithRightIcon: {
        paddingRight: 42,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    forgot: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'right',
    },
    dots: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
        marginTop: 28,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    logo: {
        margin: "auto"
    }
})

const DMLForm: FC<DMLFormProps> = () =>
{
    const appTheme = useThemedStyles()
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const form = useForm<FormSchemaType>({
        defaultValues: {
            email: "",
            password: ""
        },
        mode: "onChange",
        resolver: zodResolver(formSchema)
    })
    const { control, handleSubmit, formState } = form
    const { signInAsync } = useAuth()

    return (
        <View style={[appTheme.styles.card, styles.container]}>
            <View style={styles.header}>
                <AppLogo style={[styles.logo]} />
                <Text style={[styles.title, { color: appTheme.colors.foreground }]}>Welcome back</Text>
                <Text style={[styles.subtitle, { color: appTheme.colors.foreground }]}>Sign in to manage your print orders</Text>
            </View>
            <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                    <View style={[styles.controllerContainer]}>
                        <Text style={[styles.label]}>Email <Text style={[styles.label, { color: appTheme.colors.destructive }]}>*</Text></Text>
                        <View style={[styles.inputWrapper]}>
                            <View style={[styles.leftIcon]}>
                                <Mail size={18} color={appTheme.colors.foreground} />
                            </View>
                            <Input
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="Email address"
                                style={[styles.inputWithLeftIcon]}
                            />
                        </View>
                        {fieldState.invalid && fieldState.error && (<Text style={[styles.error, { color: appTheme.colors.destructive }]}>{fieldState.error.message}</Text>)}
                    </View>
                )}
            />
            <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                    <View style={[styles.controllerContainer]}>
                        <Text style={[styles.label]}>Password <Text style={[styles.label, { color: appTheme.colors.destructive }]}>*</Text></Text>
                        <View style={[styles.inputWrapper]}>
                            <View style={[styles.leftIcon]}>
                                <Lock size={18} color={appTheme.colors.foreground} />
                            </View>
                            <Input
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}
                                secureTextEntry={!showPassword}
                                placeholder="Password"
                                style={[styles.inputWithLeftIcon, styles.inputWithRightIcon]}
                            />
                            <Pressable
                                style={[styles.rightIcon]}
                                onPress={() => setShowPassword((prev) => !prev)}
                                hitSlop={8}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} color={appTheme.colors.foreground} />
                                ) : (
                                    <Eye size={18} color={appTheme.colors.foreground} />
                                )}
                            </Pressable>
                        </View>
                        {fieldState.invalid && fieldState.error && (<Text style={[styles.error, { color: appTheme.colors.destructive }]}>{fieldState.error.message}</Text>)}
                    </View>
                )}
            />

            <Pressable onPress={() => router.push("/auth/forgot-password")}>
                <Text style={[styles.forgot, { color: appTheme.colors.primary }]}>Forgot password?</Text>
            </Pressable>

            <Pressable
                style={[appTheme.styles.primaryButton, styles.button]}
                disabled={formState.isSubmitting}
                onPress={handleSubmit(signInAsync)}
            >
                <Text style={[appTheme.styles.primaryButtonText, styles.buttonLabel]}>Sign In</Text>
                {formState.isSubmitting && (<ActivityIndicator />)}
            </Pressable>

            <View style={[styles.footer]}>
                <Text style={{ color: appTheme.colors.foreground, fontSize: 14 }}>New user?</Text>
                <Pressable onPress={() => router.push("/auth/register")}>
                    <Text style={[styles.footerLink, { color: appTheme.colors.primary }]}>Create an account</Text>
                </Pressable>
            </View>

            <View style={styles.dots}>
                <View style={[styles.dot, { backgroundColor: CMYK.cyan }]} />
                <View style={[styles.dot, { backgroundColor: CMYK.magenta }]} />
                <View style={[styles.dot, { backgroundColor: CMYK.yellow }]} />
                <View style={[styles.dot, { backgroundColor: CMYK.orange }]} />
            </View>
        </View>
    );
}

export default DMLForm;