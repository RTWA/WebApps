import React, { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import Switch from '../../../resources/js/components/Fields/Switch';

describe('Switch Field Component', () => {

    test('Can Render', () => {
        render(<TestSwitch />);
        expect(screen.getByRole('checkbox', { name: /test switch/i })).toBeDefined();
    });

    test('Can Enable Switch', async () => {
        expect(screen.getByRole('checkbox', { name: /test switch/i })).toBeDefined();
        expect(screen.getByText('false')).toBeDefined()

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /test switch/i }));
        });
        await waitFor(() => expect(screen.getByText('true')).toBeDefined());
    });

    test('Can Disable Switch', async () => {
        expect(screen.getByRole('checkbox', { name: /test switch/i })).toBeDefined();
        expect(screen.getByText('true')).toBeDefined()

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /test switch/i }));
        });
        await waitFor(() => expect(screen.getByText('false')).toBeDefined());
    });
});

const TestSwitch = () => {
    const [value, setValue] = useState('false');

    const update = (_name, _value, _for, _index) => {
        setValue(_value);
    }

    return (
        <>
            <Switch name="test" field={{ label: 'Test Switch' }} value={value} update={update} />
            {value}
        </>
    )
}