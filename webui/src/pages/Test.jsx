export default function Test() {
    return (
        <div style={{
            padding: '50px',
            textAlign: 'center'
        }}>
            <h1 style={{
                fontSize: '48px',
                color: '#A8C9AD',
                marginBottom: '30px'
            }}>
                TEST PAGE - UPDATE VERIFICATION
            </h1>
            <p style={{
                fontSize: '24px',
                color: 'white',
                marginBottom: '20px'
            }}>
                If you can see this page, the Docker image is updating correctly!
            </p>
            <p style={{
                fontSize: '18px',
                color: '#69639E'
            }}>
                Build Time: {new Date().toISOString()}
            </p>

            {/* White box to test if it shows */}
            <div style={{
                width: '100%',
                height: '200px',
                backgroundColor: 'white',
                marginTop: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'black',
                fontWeight: 'bold'
            }}>
                WHITE BOX TEST - Can you see this?
            </div>
        </div>
    );
}
