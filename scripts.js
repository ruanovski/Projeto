const modal = {
    open(){
        document.querySelector('.modal-overlay')
        .classList.add('active')
    },
    close(){
        document.querySelector('.modal-overlay')
        .classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) ||
        []
    },
    set (transactions) {
        localStorage.setItem("dev.finances:transactions", 
        JSON.stringify(transactions))
    }
}


const Transactions = {
    all: Storage.get(),

    add(transactions){
        Transactions.all.push(transactions)

        app.reload()
    },

    remove(index){
        Transactions.all.splice(index, 1)

        app.reload()
    },

    incomes(){
        let income = 0;
        Transactions.all.forEach(transactions => {
            if(transactions.amount > 0){
                income += transactions.amount;
            }
        })
        return income;
    },
    expenses(){
        let expense = 0;
        Transactions.all.forEach(transactions => {
            if(transactions.amount < 0){
                expense += transactions.amount;
            }
        })
        return expense;
    },
    total(){
        return Transactions.incomes() + Transactions.expenses()
    }
}


const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transactions, index){ 
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transactions, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transactions, index){
        const CSSclass = transactions.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transactions.amount)

       const html = `
        <td class="description">${transactions.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td date="date">${transactions.date}</td>
        <td>
            <img onclick="Transactions.remove(${index})" 
            src="./assets/minus.svg" alt="Remover transação">
        </td>
        `
        return html
    },

    updateBalance(){
        document.getElementById("incomeDisplay")
        .innerHTML =Utils.formatCurrency(Transactions.incomes())
        document.getElementById("expenseDisplay")
        .innerHTML = Utils.formatCurrency(Transactions.expenses())
        document.getElementById("totalDisplay")
        .innerHTML = Utils.formatCurrency(Transactions.total()) 
    },

    clearTransaction(){
        DOM.transactionsContainer.innerHTML = ""
    }
}


const Utils = {
    formatAmount(value){
        value = Number(value) * 100

        return value
    },

    formartDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, '')

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }

    },

    validateField(){
        const {description, amount, date} = Form.getValues()

        if( description.trim() === "" || 
        amount.trim() === "" ||
        date.trim() ==="") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues(){
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formartDate(date)

        return{
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },


    submit(event){
        event.preventDefault()

        try {
            Form.validateField()
            const transaction =  Form.formatValues()
            Transactions.add(transaction)
            Form.clearFields()
            modal.close()
        } catch (error) {
            alert(error.message)
        }
        
       
    }
}


const app = {
    init(){
        Transactions.all.forEach((transactions, index) =>{
            DOM.addTransaction(transactions, index)
        })
        
        DOM.updateBalance()

        Storage.set(Transactions.all)
    },
   
    reload(){
        DOM.clearTransaction()
        app.init()
    }
}


app.init()



