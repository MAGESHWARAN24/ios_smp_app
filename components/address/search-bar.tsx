import { useState, type FC } from 'react';
import Input from '../ui/input';
import { useAddress } from './config';

interface SearchBarProps { }

const SearchBar: FC<SearchBarProps> = () =>
{
    const [searchString, setSearchString] = useState<string>("")
    const { debouncedFilter } = useAddress()
    const onChange = (value: string) =>
    {
        debouncedFilter(value)
        setSearchString(value)
    }

    return (
        <Input
            placeholder='Search address'
            value={searchString}
            onChangeText={onChange}
        />
    );
}

export default SearchBar;
