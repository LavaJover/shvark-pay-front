import api from "./axios"

export const fetchTraderBankDetails = async ({traderID}) => {
    const response = await api.get(`/banking/details?trader=${traderID}`)
    console.log(response.data)
    return response.data
}

export const createBankDetail = async (form) => {
    console.log(form)
    form.min_amount = parseFloat(form.min_amount)
    form.max_amount = parseFloat(form.max_amount)
    form.max_amount_day = parseFloat(form.max_amount_day)
    form.max_amount_month = parseFloat(form.max_amount_month)
    form.max_orders_simultaneosly = parseFloat(form.max_orders_simultaneosly)
    form.max_quantity_day = parseInt(form.max_quantity_day)
    form.max_quantity_month = parseInt(form.max_quantity_month)
    // form.enabled = (form.enabled === 'true')
    form.delay = form.delay*60+"s"
    try {
        const response = await api.post('/banking/details', form)
        console.log(response)
        return response.data
    }catch(err) {
        if (err.response) {
            // server responded with error
        }else if (err.request) {
            // server not responding
        }else {
            // invalid request
        }
    }
}

export const updateBankDetail = async (form) => {
    console.log("Form: ", form)
    form.min_amount = parseFloat(form.min_amount)
    form.max_amount = parseFloat(form.max_amount)
    form.max_amount_day = parseFloat(form.max_amount_day)
    form.max_amount_month = parseFloat(form.max_amount_month)
    form.max_orders_simultaneosly = parseFloat(form.max_orders_simultaneosly)
    form.max_quantity_day = parseInt(form.max_quantity_day)
    form.max_quantity_month = parseInt(form.max_quantity_month)
    // form.enabled = (form.enabled === 'true')
    form.delay = form.delay*60+"s"
    try {
        const response = await api.patch('/banking/details', {'bank_detail': form})
        console.log(response)
        return response.data
    }catch(err) {
        if (err.response) {
            // server responded with error
        }else if (err.request) {
            // server not responding
        }else {
            // invalid request
        }
    }
}

export const deleteBankDetail = async ({bankDetailID}) => {
    try {
        const response = await api.post('/banking/details/delete', {'bank_detail_id': bankDetailID})
        console.log(response)
        return response.data
    }catch(err) {
        if (err.response) {
            // server responded with error
        }else if (err.request) {
            // server not responding
        }else {
            // invalid request
        }
    }
}