// SystemSettings.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SystemSettings.css';

interface SystemProperty {
    key: string;
    value: string;
    description: string;
    editable: boolean;
}

interface LoggerConfig {
    name: string;
    configuredLevel: string | null;
    effectiveLevel: string;
}

interface Metrics {
    [key: string]: any;
}

const SystemSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('properties');
    const [properties, setProperties] = useState<SystemProperty[]>([]);
    const [loggers, setLoggers] = useState<LoggerConfig[]>([]);
    const [metrics, setMetrics] = useState<Metrics>({});
    const [health, setHealth] = useState<any>({});
    const [configProperties, setConfigProperties] = useState<ConfigProperty[]>([]);
    const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
    const [envVariables, setEnvVariables] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingProperty, setEditingProperty] = useState<string | null>(null);
    const [propertyValue, setPropertyValue] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            let response;
            switch (activeTab) {
                case 'properties':
                    response = await axios.get('/api/admin/system/properties');
                    setProperties(response.data);
                    break;
                case 'loggers':
                    response = await axios.get('/api/admin/system/loggers');
                    const loggersList: LoggerConfig[] = [];
                    Object.entries(response.data.loggers).forEach(([name, config]: [string, any]) => {
                        loggersList.push({
                            name,
                            configuredLevel: config.configuredLevel,
                            effectiveLevel: config.effectiveLevel
                        });
                    });
                    setLoggers(loggersList);
                    break;
                case 'metrics':
                    response = await axios.get('/api/admin/system/metrics');
                    setMetrics(response.data);
                    break;
                case 'health':
                    response = await axios.get('/api/admin/system/health-summary');
                    setHealth(response.data);
                    break;
                case 'config':
                    response = await axios.get('/api/admin/system/config');
                    setConfigProperties(response.data);
                    break;
                case 'features':
                    response = await axios.get('/api/admin/system/features');
                    setFeatureFlags(response.data);
                    break;
                case 'environment':
                    response = await axios.get('/api/admin/system/environment/variables');
                    setEnvVariables(response.data);
                    break;
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Fehler beim Laden der Daten');
            console.error('Fehler beim Laden:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProperty = (property: SystemProperty) => {
        setEditingProperty(property.key);
        setPropertyValue(property.value);
    };

    const handleSaveProperty = async (key: string) => {
        try {
            await axios.put(`/api/admin/system/properties/${key}`, {
                key,
                value: propertyValue
            });

            setProperties(properties.map(prop =>
                prop.key === key ? { ...prop, value: propertyValue } : prop
            ));

            setEditingProperty(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Fehler beim Speichern');
            console.error('Fehler beim Speichern:', err);
        }
    };
    
    const handleSaveConfigProperty = async (key: string, value: string) => {
        try {
            await axios.put(`/api/admin/system/config/${key}`, {
                key,
                value
            });

            setConfigProperties(configProperties.map(prop =>
                prop.key === key ? { ...prop, value } : prop
            ));

            setEditingProperty(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Fehler beim Speichern der Konfiguration');
            console.error('Fehler beim Speichern der Konfiguration:', err);
        }
    };
    
    const handleToggleFeature = async (key: string, enabled: boolean) => {
        try {
            await axios.put(`/api/admin/system/features/${key}`, {
                key,
                enabled
            });

            setFeatureFlags(featureFlags.map(flag =>
                flag.key === key ? { ...flag, enabled } : flag
            ));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Fehler beim Ändern des Feature-Status');
            console.error('Fehler beim Ändern des Feature-Status:', err);
        }
    };

    const handleSetLogLevel = async (name: string, level: string) => {
        try {
            await axios.post(`/api/admin/system/loggers/${name}`, { level });

            setLoggers(loggers.map(logger =>
                logger.name === name ? { ...logger, configuredLevel: level } : logger
            ));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Fehler beim Ändern des Log-Levels');
            console.error('Fehler beim Ändern des Log-Levels:', err);
        }
    };

    const filteredProperties = properties.filter(prop =>
        prop.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLoggers = loggers.filter(logger =>
        logger.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="system-settings">
            <h2 className="system-settings-title">Systemeinstellungen</h2>

            {error && <div className="system-settings-error">{error}</div>}

            <div className="system-settings-tabs">
                <button
                    className={`system-settings-tab ${activeTab === 'properties' ? 'active' : ''}`}
                    onClick={() => setActiveTab('properties')}
                >
                    Eigenschaften
                </button>
                <button
                    className={`system-settings-tab ${activeTab === 'config' ? 'active' : ''}`}
                    onClick={() => setActiveTab('config')}
                >
                    Konfiguration
                </button>
                <button
                    className={`system-settings-tab ${activeTab === 'features' ? 'active' : ''}`}
                    onClick={() => setActiveTab('features')}
                >
                    Feature Flags
                </button>
                <button
                    className={`system-settings-tab ${activeTab === 'loggers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('loggers')}
                >
                    Logger
                </button>
                <button
                    className={`system-settings-tab ${activeTab === 'metrics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('metrics')}
                >
                    Metriken
                </button>
                <button
                    className={`system-settings-tab ${activeTab === 'health' ? 'active' : ''}`}
                    onClick={() => setActiveTab('health')}
                >
                    Gesundheit
                </button>
                <button
                    className={`system-settings-tab ${activeTab === 'environment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('environment')}
                >
                    Umgebung
                </button>
            </div>

            <div className="system-settings-search">
                <input
                    type="text"
                    placeholder="Suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="system-settings-content">
                {loading ? (
                    <div className="system-settings-loading">Laden...</div>
                ) : (
                    <>
                        {activeTab === 'properties' && (
                            <div className="system-settings-properties">
                                <table className="system-settings-table">
                                    <thead>
                                    <tr>
                                        <th>Eigenschaft</th>
                                        <th>Wert</th>
                                        <th>Beschreibung</th>
                                        <th>Aktionen</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredProperties.map(property => (
                                        <tr key={property.key}>
                                            <td>{property.key}</td>
                                            <td>
                                                {editingProperty === property.key ? (
                                                    <input
                                                        type="text"
                                                        value={propertyValue}
                                                        onChange={(e) => setPropertyValue(e.target.value)}
                                                    />
                                                ) : (
                                                    property.value
                                                )}
                                            </td>
                                            <td>{property.description}</td>
                                            <td>
                                                {property.editable && (
                                                    editingProperty === property.key ? (
                                                        <>
                                                            <button
                                                                className="system-settings-button save"
                                                                onClick={() => handleSaveProperty(property.key)}
                                                            >
                                                                Speichern
                                                            </button>
                                                            <button
                                                                className="system-settings-button cancel"
                                                                onClick={() => setEditingProperty(null)}
                                                            >
                                                                Abbrechen
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            className="system-settings-button edit"
                                                            onClick={() => handleEditProperty(property)}
                                                        >
                                                            Bearbeiten
                                                        </button>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'loggers' && (
                            <div className="system-settings-loggers">
                                <table className="system-settings-table">
                                    <thead>
                                    <tr>
                                        <th>Logger</th>
                                        <th>Konfiguriertes Level</th>
                                        <th>Effektives Level</th>
                                        <th>Aktionen</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredLoggers.map(logger => (
                                        <tr key={logger.name}>
                                            <td>{logger.name}</td>
                                            <td>{logger.configuredLevel || 'Nicht konfiguriert'}</td>
                                            <td>{logger.effectiveLevel}</td>
                                            <td>
                                                <select 
                                                    className="system-settings-level-select"
                                                    value={logger.configuredLevel || ''}
                                                    onChange={(e) => handleSetLogLevel(logger.name, e.target.value)}
                                                >
                                                    <option value="">Wählen...</option>
                                                    <option value="TRACE">TRACE</option>
                                                    <option value="DEBUG">DEBUG</option>
                                                    <option value="INFO">INFO</option>
                                                    <option value="WARN">WARN</option>
                                                    <option value="ERROR">ERROR</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'metrics' && (
                            <div className="system-settings-metrics">
                                <div className="metrics-grid">
                                    {Object.entries(metrics).map(([key, value]) => (
                                        <div key={key} className="metric-card">
                                            <h3>{key}</h3>
                                            <pre>{JSON.stringify(value, null, 2)}</pre>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'health' && (
                            <div className="system-settings-health">
                                <div className="health-status">
                                    <div className={`health-indicator ${health.status?.toLowerCase()}`}>
                                        System Status: {health.status || 'Unbekannt'}
                                    </div>
                                </div>

                                <div className="health-components">
                                    <div className={`health-component ${health.database?.toLowerCase()}`}>
                                        <h3>Datenbank</h3>
                                        <div className="health-component-status">
                                            {health.database || 'Unbekannt'}
                                        </div>
                                    </div>

                                    <div className={`health-component ${health.diskSpace?.toLowerCase()}`}>
                                        <h3>Speicherplatz</h3>
                                        <div className="health-component-status">
                                            {health.diskSpace || 'Unbekannt'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'config' && (
                            <div className="system-settings-config">
                                <table className="system-settings-table">
                                    <thead>
                                    <tr>
                                        <th>Schlüssel</th>
                                        <th>Wert</th>
                                        <th>Beschreibung</th>
                                        <th>Aktionen</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {configProperties.filter(prop =>
                                        prop.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        prop.description.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map(property => (
                                        <tr key={property.key}>
                                            <td>{property.key}</td>
                                            <td>
                                                {editingProperty === property.key ? (
                                                    <input
                                                        type="text"
                                                        value={propertyValue}
                                                        onChange={(e) => setPropertyValue(e.target.value)}
                                                    />
                                                ) : (
                                                    property.value
                                                )}
                                            </td>
                                            <td>{property.description}</td>
                                            <td>
                                                {property.editable && (
                                                    editingProperty === property.key ? (
                                                        <>
                                                            <button
                                                                className="system-settings-button save"
                                                                onClick={() => handleSaveConfigProperty(property.key, propertyValue)}
                                                            >
                                                                Speichern
                                                            </button>
                                                            <button
                                                                className="system-settings-button cancel"
                                                                onClick={() => setEditingProperty(null)}
                                                            >
                                                                Abbrechen
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            className="system-settings-button edit"
                                                            onClick={() => {
                                                                setEditingProperty(property.key);
                                                                setPropertyValue(property.value);
                                                            }}
                                                        >
                                                            Bearbeiten
                                                        </button>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {activeTab === 'features' && (
                            <div className="system-settings-features">
                                <table className="system-settings-table">
                                    <thead>
                                    <tr>
                                        <th>Feature</th>
                                        <th>Status</th>
                                        <th>Beschreibung</th>
                                        <th>Aktionen</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {featureFlags.filter(flag =>
                                        flag.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        flag.description.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map(flag => (
                                        <tr key={flag.key}>
                                            <td>{flag.key}</td>
                                            <td>
                                                <span className={`feature-status ${flag.enabled ? 'enabled' : 'disabled'}`}>
                                                    {flag.enabled ? 'Aktiviert' : 'Deaktiviert'}
                                                </span>
                                            </td>
                                            <td>{flag.description}</td>
                                            <td>
                                                <button
                                                    className={`system-settings-button ${flag.enabled ? 'disable' : 'enable'}`}
                                                    onClick={() => handleToggleFeature(flag.key, !flag.enabled)}
                                                >
                                                    {flag.enabled ? 'Deaktivieren' : 'Aktivieren'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {activeTab === 'environment' && (
                            <div className="system-settings-environment">
                                <table className="system-settings-table">
                                    <thead>
                                    <tr>
                                        <th>Variable</th>
                                        <th>Wert</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {Object.entries(envVariables)
                                        .filter(([key, value]) => 
                                            key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            value.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map(([key, value]) => (
                                        <tr key={key}>
                                            <td>{key}</td>
                                            <td>{value}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SystemSettings;