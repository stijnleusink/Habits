import {Component,type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import {AppProvider} from './app-context';
import './styles.css';
class ErrorBoundary extends Component<{children:ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true};}render(){return this.state.error?<main className="startup"><h1>Er ging iets mis met het scherm.</h1><p>Je opgeslagen gegevens blijven bewaard. Herlaad de app. Wis geen websitegegevens.</p><button onClick={()=>location.reload()}>Opnieuw openen</button></main>:this.props.children;}}
createRoot(document.getElementById('root')!).render(<ErrorBoundary><AppProvider><App/></AppProvider></ErrorBoundary>);
