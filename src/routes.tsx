import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { TopicPage } from './pages/TopicPage';
import { GameSelectPage } from './pages/GameSelectPage';
import { PlayPage } from './pages/PlayPage';
import { StatsPage } from './pages/StatsPage';
import { RankingPage } from './pages/RankingPage';
import { AccountPage } from './pages/AccountPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'topic/:topicId', element: <TopicPage /> },
      { path: 'topic/:topicId/:subtopicId', element: <GameSelectPage /> },
      { path: 'play/:topicId/:subtopicId/:gameId', element: <PlayPage /> },
      { path: 'stats', element: <StatsPage /> },
      { path: 'ranking', element: <RankingPage /> },
      { path: 'account', element: <AccountPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
