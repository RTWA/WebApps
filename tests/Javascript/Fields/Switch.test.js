import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import Switch from '../../../resources/js/components/Fields/Switch';

const mockFunction = jest.fn((e) => {
    return null;
});

let value = 'false';

describe('Switch Field Component', () => {

    test('Can Render Switch', () => {
        render(<Switch name="test" field={{ label: 'Test Switch' }} value={value} update={mockFunction} />);

        expect(screen.getByRole('checkbox', { name: /test switch/i })).toBeDefined();
    });

    test('Can Enable Switch', async () => {
        value = 'false';

        expect(screen.getByRole('checkbox', { name: /test switch/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /test switch/i }));
            value = 'true';
        });
        await waitFor(() =>
            screen.getByRole('checkbox', { name: /test switch/i })
        );

        expect(mockFunction).toHaveBeenCalled();
    });

    test('Can Disable Switch', async () => {
        value = 'true';

        expect(screen.getByRole('checkbox', { name: /test switch/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /test switch/i }));
            value = 'false';
        });
        await waitFor(() =>
            screen.getByRole('checkbox', { name: /test switch/i })
        );

        expect(mockFunction).toHaveBeenCalled();
    });
});