interface LoadingScreenProps {
  message: string
}

export const LoadingScreen = ({ message }: LoadingScreenProps) => (
  <div className="loader-wrap" aria-live="polite">
    <div className="loader-card">
      <div className="eyebrow">Frankie is fluffing the nest</div>
      <h2 className="section-title" style={{ marginTop: '0.9rem' }}>
        {message}
      </h2>
      <p>Streaming the farm, pond, and birdhouse stand-ins.</p>
      <div className="loader-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  </div>
)
