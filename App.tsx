import React from 'react';
import { AuthProvider } from './app/contexts/AuthContext';
import AppNavigator from './app/navigation/AppNavigator';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
};

export default App;
