import type { PropsWithChildren } from 'react';
import { Container } from '@mui/material';
import { Notifier } from '../common/Notifier';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="ms-shell">
      <Header />
      <Container component="main" maxWidth="lg" className="ms-main">
        {children}
      </Container>
      <Footer />
      <Notifier />
    </div>
  );
}
