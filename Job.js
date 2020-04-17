export default class Job {

    constructor(props) {
        this.props = props
    }

    data() {
        return this.props
    }

    toString() {
        return JSON.stringify(this.props)
    }
}