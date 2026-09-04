import AddressProvider from "@/components/address/provider";
import AddressScreen from '@/components/address/screen';
import type { FC } from 'react';

interface AddressProps { }

const Address: FC<AddressProps> = () =>
{
    return (
        <AddressProvider>
            <AddressScreen />
        </AddressProvider>
    );
}

export default Address;
