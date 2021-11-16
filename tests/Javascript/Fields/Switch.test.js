import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import Switch from '../../../resources/js/components/Fields/Switch';

const mockFunction = jest.fn((e) => {
    return null;
});

test('Can Render Switch', () => {
    let value = 'false';
    render(<Switch name="test" field={{ label: 'Test Switch' }} value={value} update={mockFunction} />);

    expect(screen.getByRole('checkbox', { name: /test switch/i })).toBeDefined();
});

test('Can Enable Switch', async () => {
    let value = 'false';
    render(<Switch name="test" field={{ label: 'Test Switch' }} value={value} update={mockFunction} />);

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
    let value = 'true';
    render(<Switch name="test" field={{ label: 'Test Switch' }} value={value} update={mockFunction} />);

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