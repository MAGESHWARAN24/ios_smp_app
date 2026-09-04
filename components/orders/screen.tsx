import type { FC } from 'react';
import OrderList from './order-list';

interface OrderScreenProps { }

const OrderScreen: FC<OrderScreenProps> = () =>
{
    return (
        <OrderList />
    );
}

export default OrderScreen;
