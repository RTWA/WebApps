import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { WebApps } from 'webapps-react';

import AppsPlugins from '../../../resources/js/components/Routes/Settings/AppsPlugins';

test('Renders Apps & Plugins', async () => {
    render(<WebApps><BrowserRouter><AppsPlugins /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByText(/No Plugins Downloaded!/i));

    // Test Plugins
    expect(screen.getByRole('heading', { name: /plugins/i })).toBeDefined();
    expect(screen.getByText(/sample/i)).toBeDefined();
    expect(screen.getByText(/jest/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /get more plugins/i })).toBeDefined();

    // Test Apps
    expect(screen.getByRole('heading', { name: /apps/i })).toBeDefined();
    expect(screen.getByText(/demo app/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /get more apps/i })).toBeDefined();
});