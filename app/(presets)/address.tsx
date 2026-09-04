import ShippingAddressScreen from '@/components/shipping-address/screen';
import type { FC } from 'react';

interface AddressProps { }

const Address: FC<AddressProps> = () =>
{
    return (
        <ShippingAddressScreen />
    );
}

export default Address;
