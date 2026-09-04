import { spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import
{
    ChevronDown,
    CreditCard,
    Factory,
    FileText,
    Scissors,
    Truck,
    UserCircle,
    XCircle,
    type LucideIcon,
} from 'lucide-react-native';
import { useState, type FC } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface SupportScreenProps { }

/* ─── Data ───────────────────────────────────────────────────────────────── */

interface Faq
{
    q: string;
    a: string;
}

interface FaqSectionData
{
    title: string;
    icon: LucideIcon;
    faqs: Faq[];
}

const faqSections: FaqSectionData[] = [
    {
        title: 'My Account',
        icon: UserCircle,
        faqs: [
            {
                q: 'How do I activate my account?',
                a: "After completing the registration form, your mobile number will be verified with OTP (you can click RESEND OTP if you didn't receive the OTP SMS) and then a confirmation mail will be sent to the registered E-mail ID. You have to confirm the account by clicking 'CONFIRM ACCOUNT' button found in the confirmation mail. This confirmation mail will be in the inbox or it will be in the Promotion / Updates tab or in Spam if your mail account is a Gmail account. Once you confirm your account it will take 24 hours for admin verification. You will be receiving a call from us asking for the details about your firm, once the details are found to be authentic and satisfactory the account will be activated. You can login only after the account confirmation done from our side. We strongly recommend that our customer must be a Printers / Designers with good knowledge in Offset Printing.",
            },
            {
                q: 'Can I change the email address in my Shree Maruthi Printers online account?',
                a: 'The email address that you have registered with us is your Login ID, this ID cannot be changed or edited. If you need to use a different email address you will need to create a new online account with the desired address.',
            },
            {
                q: 'I forgot my password. What can I do?',
                a: 'If you know your e-mail address, but have forgotten your password, Click "Forgot Your Password?" below Login button in Home page. A new page appears to retrieve your password, there you can enter your registered e-mail ID and Captcha, after click "Submit" button you will get a message. You will be receiving a mail to your e-mail address, in that mail you can see a "RESET PASSWORD" button. After clicking it you will be redirected to our website, there you can type the new password two times and then click "RESET A PASSWORD" button. Finally your password will be reset.',
            },
            {
                q: 'How do I update my account information?',
                a: 'To update your account information, go to My Account and click Account Dashboard or Account Information to update the details. You can adjust your Name, Password and subscribe for our newsletter and updates. Note that the email attached to the account cannot be changed. If you need to use another email address you will need to create a new online account.',
            },
        ],
    },
    {
        title: 'File for Printing',
        icon: FileText,
        faqs: [
            {
                q: 'How do I add items to my cart?',
                a: 'To add a Product or item to the cart, click "Products Category" from that dropdown menu you can select the item that you want and then add file for printing as per the specified dimension. There you can change the quantity that is required in "Qty" field. By clicking the "Add to Cart" button, you will get a message that your item was added to your shopping cart.',
            },
            {
                q: 'Can I upload CDR file format?',
                a: 'CDR format is not allowed. PDF, JPEG and PNG are the formats that are allowed to upload in our Website. PDF is your recommended format for good results.',
            },
            {
                q: 'How do I view what is in my shopping cart?',
                a: 'To view the contents of your cart, click on the "Cart" icon in the upper-right corner of your computer screen. You can see the shopping cart with the list of the products you have added if any. From there you can delete the products or items, you can change the quantity and you can even empty the cart.',
            },
            {
                q: 'How do I remove items from my cart?',
                a: 'First, click on the "Cart" in the upper-right corner of your computer screen. This will allow you to view all the items currently in your cart. Once you have identified the item that you would like to delete, click on the bin icon shown at the last column next to subtotal. You can also remove all the items in the cart by clicking "Empty Cart" button.',
            },
            {
                q: 'How do I change the quantity of a particular item in my cart?',
                a: 'First, click on the "Cart" in the upper-right corner. This will show all items currently in your cart with quantities. To change the quantity, move your cursor to the box under the "Qty" header for this item and type in the quantity desired, then click the "Update" button. The quantity and associated amount will be automatically updated.',
            },
            {
                q: 'How will I know that you have received my order?',
                a: 'After you complete the checkout process, a page will appear showing "YOUR ORDER HAS BEEN RECEIVED. THANK YOU FOR YOUR PURCHASE" and your order number will be shown (starting with "M"). You will also receive confirmation via e-mail.',
            },
            {
                q: 'Does Shree Maruthi Printers do any editing / design changes in the file after placing order?',
                a: 'Shree Maruthi Printers is a print only service and does not make any changes in the Customer files. If you have any changes in the art-work after placing an order, you can call our Online Customer Helpline and can cancel the order if the Set is not taken. Cancelled order amount will be refunded to wallet and then you can place the order again with the new corrected design.',
            },
            {
                q: 'Can I re-order?',
                a: 'There is no re-order facility. You need to upload the files in the site and need to place it as usual.',
            },
            {
                q: 'Can I place an order any other way than online?',
                a: 'Shree Maruthi Printers receives orders through online from Customers. Only for Products that are not available in the website you can place orders through Email. You can get the quotation from the quotation section and Art-work can be sent through Email with the payment challan / screenshot attached. Refer Contact Us page for details.',
            },
            {
                q: 'Where can I check the details on the order?',
                a: 'Log in > My Account > My Orders. The details and status of your orders will be listed there.',
            },
        ],
    },
    {
        title: 'Payment & Billing',
        icon: CreditCard,
        faqs: [
            {
                q: 'What are your payment options?',
                a: 'First option is to pay on account using wallet and second option is using Credit/Debit card, Internet banking through payment gateway.',
            },
            {
                q: 'How to add amount to wallet?',
                a: 'There are two options to add amount to your wallet. One is to do NEFT/RTGS to our banking account — you have to take the screenshot of the success transaction and upload it in "Add Wallet Challan". Another option is to deposit amount to our bank account directly at the bank and upload the counter slip. You can find "Add Wallet Challan" option in My Account → My Wallet. Challan verification takes four hours. It is recommended to upload before 4:30 PM, else it will be credited the next day.',
            },
            {
                q: 'Can I send payment using a bank account instead of card?',
                a: 'Yes you can. Please use the Bank account details given in My Account → My Wallet → Add Wallet Challan to send your payment. After sending the amount, take the Screenshot of the Success Payment and upload the challan. Verification takes four hours. Upload before 4:30 PM for same-day credit.',
            },
            {
                q: 'Does Shree Maruthi Printers keep my Credit Card info on file?',
                a: 'Shree Maruthi Printers uses a 3rd party merchant service to process all credit card / debit card / internet banking payments, so no payment information is stored on our side. Each order requires that you re-enter your payment information.',
            },
            {
                q: 'Amount was debited but order status shows cancelled / pending. Will I get my money back?',
                a: 'If the order status is cancelled / pending, that particular order will not be taken by us even if the Amount is debited initially. Wait 15-20 minutes and check for status change to "Ready to Batch". If still cancelled / pending, you can place the order again if urgent, or wait 2-4 days for us to receive the record from CCAvenue. The amount will be reversed to your bank account or added to wallet as per your convenience.',
            },
            {
                q: 'Can I get a price quote?',
                a: 'Prices are available near the products in the website. For custom requests, please submit your specifications to our quotation mail ID available in Contact Us page and the price quote will be mailed back.',
            },
            {
                q: 'How do I get my Invoice?',
                a: 'The order confirmation will be emailed after your order is placed, but this is not the actual invoice. Invoice will be mailed to your Registered mail ID every month end.',
            },
        ],
    },
    {
        title: 'File Preparation',
        icon: Scissors,
        faqs: [
            {
                q: 'What is the cutting margin of error?',
                a: 'During the cutting process the stock can shift 1-2mm in any direction due to blade pressure, stock characteristics, or other external factors. This shift is normally unnoticeable but can become visible if a border is included in the design or if design elements are too close to the trim line.',
            },
            {
                q: 'How can I make a subtle pattern on top of a background colour?',
                a: 'For a pattern to be distinguishable we recommend a 15 to 20 percent difference between the background and the pattern. Anything less and the pattern might not be visible.',
            },
            {
                q: 'What is the Overprint function and when should it be used?',
                a: 'When two objects of different colours overlap, they knockout — they will not print on top of each other. To intentionally print one layer of ink on top of another is to overprint. This can be useful to eliminate gaps between touching colours. Use with caution — incorrect use can produce unwanted results. Shree Maruthi Printers will not compensate for misuse of the "overprint" function.',
            },
            {
                q: 'Can I upload Horizontal front and vertical back or vice-versa?',
                a: 'Yes, but both submitted files must be in the same orientation (either both vertical or both horizontal). The design itself can be horizontal or vertical but the file orientation should be the same. Refer the Front and Back Upload method in Online Guide for more details.',
            },
            {
                q: 'How do I make sure that my fonts appear as I have created them?',
                a: 'Shree Maruthi Printers does not have the fonts that you have used in your design. You have to curve all the texts / follow the video — How to convert .cdr to .pdf available in our YouTube channel / Video Tutorial.',
            },
            {
                q: 'What black value do you recommend? What is solid black?',
                a: 'For Solid Black: C-30%, M-30%, Y-30% and K-100% is the recommended colour ratio for Black patch/tint. For Black letter: C-0%, M-0%, Y-0% and K-100%.',
            },
            {
                q: 'Can I add a border to my design?',
                a: 'We do not recommend borders in designs. During cutting, stock can shift 1-2mm in any direction, making borders appear uneven after cutting.',
            },
            {
                q: 'Will my QR code scan?',
                a: 'QR codes are considered as design, and Shree Maruthi Printers will not be held responsible for codes that do not scan properly. We cannot compensate for QR readers and/or software.',
            },
        ],
    },
    {
        title: 'Production',
        icon: Factory,
        faqs: [
            {
                q: 'What is CMYK offset Printing?',
                a: 'Shree Maruthi Printers is a CMYK offset gang printing service. We do not match Pantone colours and recommend that all files be created in CMYK (not just converted). CMYK stands for Cyan, Magenta, Yellow and Key (Black). RGB (Red, Green, Blue) is used by monitors and has a larger colour range — colours may look different when printed in CMYK. If you send RGB files they will be automatically converted to CMYK, which may cause colour shifts.',
            },
            {
                q: 'What is gang printing?',
                a: 'Gang-run printing places multiple print projects on a common paper sheet to reduce costs and waste. It is extremely economical as many jobs share the same run, reducing manpower, plates, prep time, and labor. The trade-off is that colour control is not as precise as spot printing.',
            },
            {
                q: 'Do you match Pantone Colours?',
                a: 'No. Shree Maruthi Printers is a CMYK offset printer, no Pantone PMS colours can be matched. All files should be created in CMYK. Files not in CMYK will be automatically converted.',
            },
            {
                q: 'What are the printing colour options 4C+0, 4C+1C, 4C+4C?',
                a: '4C+0 — Full colour front / Blank Back. 4C+1C — Full colour front / Black ink only on Back. 4C+4C — Full colour front / Full colour back.',
            },
            {
                q: 'Can I get samples of your product?',
                a: 'Yes, Product catalogue is available in our Website and you can place the order to receive it.',
            },
            {
                q: 'How will the actual orientation of my files be placed on the final product?',
                a: 'If you want a horizontal card, provide all files horizontally. If vertical, provide all files vertically. The back design should be the result of flipping the front from left to right.',
            },
            {
                q: 'Does Shree Maruthi Printers guarantee deadlines or provide rush services?',
                a: 'No. All listed turnaround times are estimates. Gang printing does not allow us to review results until print is completed. No rush services are available. Clients must allow enough time for estimated turnaround plus possible delays.',
            },
            {
                q: 'Will my product be centered?',
                a: 'During cutting there is a 1-2mm margin of error. We do not guarantee 100% center cuts. Please keep this in mind when creating your design.',
            },
            {
                q: 'Will I get the exact colour in the printed job as per the design?',
                a: 'In gang printing, there can be 30-40% colour variation compared to the design. Ink feeding is optimised for gang runs. Screens display in RGB while we print in CMYK, causing some mismatch. Colour results may also vary by stock type, weather conditions, and timing.',
            },
            {
                q: 'How much time is required for production?',
                a: 'Turnaround times are estimates. Shree Maruthi Printers does not guarantee deadlines and there is no rush service.',
            },
            {
                q: 'Is it possible to waive minimum quantity required for ordering?',
                a: 'No. The minimum quantity is 500. You can order 500, 1000, 2000, etc. For 1500, place two orders — one for 500 and one for 1000. However, we frequently offer minimum 500 cards with some particular stocks.',
            },
            {
                q: 'Why is the printed colour different from the colour I see on the computer?',
                a: "Screens display in RGB while we print in CMYK — the printed colour will never perfectly match the on-screen colour. Colours vary from monitor to monitor, and different printers produce different results. We cannot compensate for colour variance on each customer's monitor.",
            },
            {
                q: 'How do I place more than one product in a single order?',
                a: 'Upload file in one product and Add to Cart. Repeat for all desired products. The cart will display the number of products added. Click the cart to see all products and place the order.',
            },
        ],
    },
    {
        title: 'Shipping & Delivery',
        icon: Truck,
        faqs: [
            {
                q: 'What are your shipping and handling rates?',
                a: 'Rates vary depending on destination, product weight and quantity. Two options: courier and transport (to pay). Courier charges for a single visiting card (500/1000) within Tamil Nadu is ₹30 and for other states ₹60. For other products, charges will be shown while placing the order.',
            },
            {
                q: 'Can I pick up my Orders from your other Branch offices?',
                a: 'Only Coimbatore customers can pick up orders from our head office. This facility is not available in other branches.',
            },
            {
                q: 'What Courier Company is used for Shipping?',
                a: 'Professional Couriers. For North India, the Courier Company differs by State.',
            },
            {
                q: 'How can I find out about the status of my delivery?',
                a: 'For Transport — LR number will be sent through SMS to your registered mobile number. Courier tracking number can be received from Dispatch section through phone and tracked on the respective Courier Service Website.',
            },
            {
                q: 'Can I consolidate shipping between multiple orders?',
                a: 'Shipping can only be consolidated when orders are placed together in one checkout. If both orders are completed around the same time and it is possible, we can ship them together; otherwise they will be shipped upon completion.',
            },
            {
                q: 'Is blind shipping available?',
                a: 'Orders are shipped without any payment or pricing information. The package will not be branded and no advertising will be included. You can ship orders directly to your customers.',
            },
            {
                q: 'Who pays for the delivery? Can I avoid the shipping charge?',
                a: "Customer pays for delivery — charges are added during checkout. The shipping costs are Professional Courier's pricing (we do not mark up). Unfortunately the shipping fee cannot be bypassed. To compensate, we offer the lowest pricing possible on our products.",
            },
            {
                q: 'What is the required lead time for delivery?',
                a: 'After production is completed, we ship via Professional Courier: 2 business days. Additional days may be required if your area is not serviced by Professional Courier.',
            },
            {
                q: 'Can I change my shipping address?',
                a: 'We cannot guarantee address changes, however if your order has not yet been shipped you can contact us via Online Customer Helpline to request a change. If already shipped, no change is possible.',
            },
            {
                q: 'Where can I track the shipped item?',
                a: 'You can track the item on the corresponding Courier service website.',
            },
            {
                q: "What happens if I haven't received the product?",
                a: 'Check the delivery tracking first. Contact Professional Courier with your tracking number. For further assistance, contact our customer helpline.',
            },
        ],
    },
    {
        title: 'Cancellation & Changes',
        icon: XCircle,
        faqs: [
            {
                q: 'Can I cancel my order?',
                a: 'Due to the swift nature of our business, we process orders as soon as we receive them. No cancellations or refunds are available on orders that have gone to CTP. Shree Maruthi Printers is not responsible for any duplicated orders placed due to customer mistake.',
            },
            {
                q: 'Can I change my order?',
                a: 'Before Checkout / Payment: You can click the Bin icon near the product on your cart. After Checkout / Payment: Orders cannot be changed once placed. We run a gang printing service meaning many jobs run at once — we cannot stop or make changes during a print cycle. NOTE: Shree Maruthi Printers is not responsible for duplicated orders, incorrect files, or errors placed on our website.',
            },
        ],
    },
];

const importantNotes = [
    'Correct page orientation is important. If pages are not correctly oriented, this may lead to pages being upside down after printing.',
    'Upload file name should not contain spaces or special characters. Use descriptive names like: masparesfront, masparesback, masparesUVfile.',
    'Accepted file formats: PDF (recommended), JPEG, PNG. CDR format is not allowed.',
];

/* ─── Accordion item ─────────────────────────────────────────────────────── */

function AccordionItem({ faq, itemKey, isOpen, onToggle }: {
    faq: Faq;
    itemKey: string;
    isOpen: boolean;
    onToggle: (key: string) => void;
})
{
    const { colors } = useThemedStyles()

    return (
        <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Pressable
                onPress={() => onToggle(itemKey)}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: spacing * 3,
                    gap: spacing * 2,
                }}
            >
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: colors.foreground }}>
                    {faq.q}
                </Text>
                <View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}>
                    <ChevronDown size={16} color={colors.mutedForeground} />
                </View>
            </Pressable>
            {isOpen && (
                <Text style={{ fontSize: 13, color: colors.mutedForeground, lineHeight: 20, paddingBottom: spacing * 3 }}>
                    {faq.a}
                </Text>
            )}
        </View>
    )
}

/* ─── Screen ─────────────────────────────────────────────────────────────── */

const SupportScreen: FC<SupportScreenProps> = () =>
{
    const { colors, styles, shadows } = useThemedStyles()
    const [openKeys, setOpenKeys] = useState<Set<string>>(new Set())

    const toggle = (key: string) =>
    {
        setOpenKeys((current) =>
        {
            const next = new Set(current)
            if (next.has(key))
            {
                next.delete(key)
            } else
            {
                next.add(key)
            }
            return next
        })
    }

    return (
        <ScrollView
            style={[styles.screen, { flex: 1 }]}
            contentContainerStyle={{ padding: spacing * 4, gap: spacing * 5, paddingBottom: spacing * 10 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Hero */}
            <View style={{ paddingVertical: spacing * 4, alignItems: 'center' }}>
                <Text style={{ fontSize: 26, fontWeight: 'bold', color: colors.foreground, textAlign: 'center' }}>
                    Online Guide & FAQs
                </Text>
                <Text style={{ fontSize: 13, color: colors.mutedForeground, textAlign: 'center', marginTop: 10, lineHeight: 19 }}>
                    Everything you need to know about ordering, file preparation, payments, production, and shipping.
                </Text>
            </View>

            {/* Important notes */}
            <View
                style={[
                    styles.card,
                    { ...shadows.sm, padding: spacing * 4, borderColor: colors.accent + '40', backgroundColor: colors.accent + '0d' },
                ]}
            >
                <Text style={{ fontSize: 15, fontWeight: 'bold', color: colors.foreground, marginBottom: 10 }}>
                    📌 Important Notes
                </Text>
                <View style={{ gap: 8 }}>
                    {importantNotes.map((note, i) => (
                        <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
                            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{'\u2022'}</Text>
                            <Text style={{ flex: 1, fontSize: 13, color: colors.mutedForeground, lineHeight: 19 }}>
                                {note}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* FAQ sections */}
            {faqSections.map((section) =>
            {
                const Icon = section.icon
                return (
                    <View key={section.title} style={[styles.card, { ...shadows.sm, padding: spacing * 4 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing * 2 }}>
                            <View
                                style={{
                                    height: 36,
                                    width: 36,
                                    borderRadius: 10,
                                    backgroundColor: colors.accent + '1a',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Icon size={18} color={colors.accent} />
                            </View>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.foreground }}>
                                {section.title}
                            </Text>
                        </View>

                        {section.faqs.map((faq, idx) =>
                        {
                            const key = `${section.title}-${idx}`
                            return (
                                <AccordionItem
                                    key={key}
                                    itemKey={key}
                                    faq={faq}
                                    isOpen={openKeys.has(key)}
                                    onToggle={toggle}
                                />
                            )
                        })}
                    </View>
                )
            })}
        </ScrollView>
    );
}

export default SupportScreen;