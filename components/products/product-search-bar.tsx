import type { FC } from 'react';
import Input from '../ui/input';
import { useProduct } from './config';

interface ProductSearchBarProps { }

const ProductSearchBar: FC<ProductSearchBarProps> = () =>
{
    const { applyFilter, filter } = useProduct()
    const onChange = (searchString: string) =>
    {
        applyFilter({ productTypeId: filter.productTypeId, searchString })
    }

    return (
        <Input
            value={filter.searchString}
            placeholder='Search..'
            onChangeText={onChange}
        />
    );
}

export default ProductSearchBar;
