import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { WebApps } from 'webapps-react';

import Select from '../../../resources/js/components/Fields/Select';

const mockFunction = jest.fn((e) => {
    return null;
});

test('Can Render Select', () => {
    let value = '1';
    render(<WebApps><Select name="test" field={{ label: 'Test Select', options: ['1', 'a', 'test'] }} value={value} update={mockFunction} /></WebApps>);

    expect(screen.getByRole('combobox', { name: /test select/i })).toBeDefined();
});

test('Can Select An Option', async () => {
    let value = '1';
    render(<WebApps><Select name="test" field={{ label: 'Test Select', options: ['1', 'a', 'test'] }} value={value} update={mockFunction} /></WebApps>);

    expect(screen.getByRole('combobox', { name: /test select/i })).toBeDefined();
    expect(screen.getByRole('combobox', { name: /test select/i }).children).toHaveLength(3);

    await act(async () => {
        fireEvent.change(screen.getByRole('combobox', { name: /test select/i }), { target: { value: 'test' } });
        await screen.getByRole('combobox', { name: /test select/i }).value === 'test';
    });

    expect(mockFunction).toHaveBeenCalled();
});