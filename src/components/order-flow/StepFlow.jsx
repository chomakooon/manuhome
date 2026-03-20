import './StepFlow.css';

export default function StepFlow({ steps }) {
    return (
        <div className="step-flow">
            {steps.map((step, i) => (
                <div className="step-flow__item" key={i}>
                    <div className="step-flow__number">{String(i + 1).padStart(2, '0')}</div>
                    <div className="step-flow__connector" />
                    <div className="step-flow__content">
                        <h4 className="step-flow__title">{step.title}</h4>
                        <p className="step-flow__description">{step.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
