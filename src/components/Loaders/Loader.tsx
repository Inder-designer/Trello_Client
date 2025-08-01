import "./Loader.css"

const Loader = ({ type = 'bar', w = '26', h = "14", classes = "" }: { type?: string, w?: string, h?: string, classes?: string }) => {
    return (
        <>
            <div className={`custom-loader ${type} ${classes}`} style={{ width: `${w}px`, height: `${h}px` }}></div>
        </>
    )
}

export default Loader