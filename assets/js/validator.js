/*
Validator({
            form: '#form-1',
            formGroupSelector: '.auth-form__group',
            errorSelector: ".form-message",
            rules: [
                Validator.isRequired('#fullname'),
                Validator.isRequired('#email'),
                Validator.isEmail('#email'),
                Validator.isRequired('input[name="gender"]'),
                Validator.isRequired('input[name="policy"]'),
                Validator.isRequired('#province'),
                Validator.minLength('#password', 8),
                Validator.isRequired('#password-confirmation'),
                Validator.isConfirmed('#password-confirmation', function() {
                    return document.querySelector('#form-1 #password').value;
                }, 'Mật khẩu nhập lại không chính xác')
            ], onSubmit(data) {
                //call API
                console.log(data);
            }
        });
*/

function Validator (options) {

    //Tìm parentElement (thêm khi các thẻ con input và errorElement trong form-group không đồng cấp)
    function getParent (element, selector){
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }


    //Lấy element của form cần validate
    const formElement = document.querySelector(options.form);

    //Validate toàn bộ Khi submit form
    if (formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault(); //Bỏ hành vi mặc định khi submit
            
            //Biến kiểm tra lỗi toàn form
            let isFormValid = true;
            
            //Lặp qua từng rule và validate toàn bộ
            options.rules.forEach(function (rule, index) {
                var inputElements = formElement.querySelectorAll(rule.selector);
                //dùng All vì các thẻ như checkbox, radio dùng chung rule.selector ví dụ name
                //không ảnh hưởng đến thẻ input text dùng id
                Array.from(inputElements).forEach((inputElement) => {
                    const errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    let errorMessage;
    
                    //Xử lý nhiều rules
                    const rules = selectorRules[rule.selector];
                    for (let i = 0; i < rules.length; i++){
                        switch (inputElement.type) {
                            case 'radio':
                            case 'checkbox':
                                errorMessage = rules[i](
                                    //radio và checkbox có value không phải là nội dung nhập vào
                                    formElement.querySelector(rule.selector + ':checked')
                                    //truyền vào hàm rules[i] một element: input[name="gender"]:checked
                                    //tức là thẻ input có name là gender được check
                                    //lúc này value phía dưới sẽ nhận nguyên cái thẻ, nhưng ta chỉ kiểm tra isRequired nên ok
                                );
                                break;
                            default:
                                errorMessage = rules[i](inputElement.value);
                        }
                        
                        if (errorMessage) {
                            break;
                        }
                    }
    
                    if(errorMessage) {
                        errorElement.innerText = errorMessage;
                        getParent(inputElement, options.formGroupSelector).classList.add("invalid");
                    }else {
                        errorElement.innerText = "";
                        getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
                    }
    
                    //Biến kiểm tra lỗi mỗi rule
                    let isValid = !errorMessage //chuyển sang boolean
                    //errorMessage là true nghĩa là có lỗi => isValid = fasle
                    if (!isValid) {
                        isFormValid = false;
                    }
                })
            });

            if (isFormValid) {
                //submit với js
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    //Select tất cả thẻ có name, và không có disabled
                    var formValues = Array.from(enableInputs).reduce((values, input) => {
                        switch (input.type) {
                            case 'radio':
                                //do có nhiều thẻ radio trùng name, nhưng chỉ có 1 thẻ được checked,
                                //chỉ gán value đối với thẻ được checked
                                if (input.matches(':checked')) {
                                    values[input.name] = input.value;
                                }
                                break;
                            case 'checkbox':
                                //do có nhiều thẻ checkbox trùng name, và có thể có nhiều thẻ được checked,
                                //gán hết thẻ được checked vào mảng
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                if (input.matches(':checked')) {
                                    values[input.name].push(input.value);
                                }
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    //Trả lại dữ liệu cho callback bên html
                    options.onSubmit(formValues);
                }
                //submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            } else {
                console.log('Form Bug!')
            }
        }
    }



    //Biến lưu rules
    var selectorRules = {};

    //Lặp qua mỗi rule và xử lý(lắng nghe sự kiện)
    options.rules.forEach((rule, index) => {

        //Lưu lại các rules cho mỗi input
        if(Array.isArray(selectorRules[rule.selector])) {
            selectorRules[rule.selector].push(rule.test);
        } else {
            selectorRules[rule.selector] = [rule.test];
        }

        const inputElement = formElement.querySelector(rule.selector);

        if(inputElement) {
            //Xử lý trường hợp blur khỏi input
            inputElement.onblur = () => {
                const errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                let errorMessage;

                //Xử lý nhiều rules
                const rules = selectorRules[rule.selector];
                for (let i = 0; i < rules.length; i++){
                    switch (inputElement.type) {
                        case 'radio':
                        case 'checkbox':

                        default:
                            errorMessage = rules[i](inputElement.value);
                    }
                    if (errorMessage) {
                        break;
                    }
                }

                if(errorMessage) {
                    errorElement.innerText = errorMessage;
                    getParent(inputElement, options.formGroupSelector).classList.add("invalid");
                }else {
                    errorElement.innerText = "";
                    getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
                }
            }

            //Xử lý trường hợp khi người dùng nhập vào input
            inputElement.oninput = () => {
                const errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                errorElement.innerText = "";
                getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
            }

        }
    });
    
}

Validator.isRequired = function(selector) {
    return {
        selector,
        test(value) {
            console.log(value);
            return value ? undefined: 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function(selector) {
    return {
        selector,
        test(value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email'
        }
    }
}

Validator.minLength = function(selector, minLength) {
    return {
        selector,
        test(value) {
            return value.length >= minLength ? undefined : `Mật khẩu tối thiểu ${minLength} ký tự`
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}