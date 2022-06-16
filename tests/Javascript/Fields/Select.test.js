import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { WebAppsUX } from 'webapps-react';

import Select from '../../../resources/js/components/Fields/Select';

const mockFunction = jest.fn((e) => {
    return null;
});

describe('Select Field Component', () => {
    test('Can Render', async () => {
        let value = '1';
        render(<WebAppsUX><Select name="test" field={{ label: 'Test Select', options: ['1', 'a', 'test'] }} value={value} update={mockFunction} /></WebAppsUX>);
        await waitFor(() => expect(screen.getByRole('combobox', { name: /test select/i })).toBeDefined());
    });

    test('Can Select An Option', async () => {
        expect(screen.getByRole('combobox', { name: /test select/i })).toBeDefined();
        expect(screen.getByRole('combobox', { name: /test select/i }).children).toHaveLength(3);

        await act(async () => {
            fireEvent.change(screen.getByRole('combobox', { name: /test select/i }), { target: { value: 'test' } });
            await screen.getByRole('combobox', { name: /test select/i }).value === 'test';
        });

        expect(mockFunction).toHaveBeenCalled();
    });

});