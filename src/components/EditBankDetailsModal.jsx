import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../contexts/AuthContext"
import { createBankDetail, updateBankDetail } from "../api/banking"
import './Modal.css'
import api from "../api/axios"
import { toast } from "react-toastify"

const EditbankDetailsModal = ({isOpen, onClose, onSuccess, detail}) => {

    if (!isOpen) return null

    const {traderID} = useAuth()

    const [form, setForm] = useState({
        id: detail.id,
        trader_id: traderID,
        currency: detail.currency,
        inflow_currency: detail.inflow_currency,
        payment_system: detail.payment_system,
        bank_name: detail.bank_name,
        bank_code: detail.bank_code,
        nspk_code: detail.nspk_code,
        card_number: detail.card_number,
        phone: detail.phone,
        owner: detail.owner,
        min_amount: detail.min_amount,
        max_amount: detail.max_amount,
        max_amount_day: detail.max_amount_day,
        max_amount_month: detail.max_amount_month,
        max_quantity_day: detail.max_quantity_day,
        max_quantity_month: detail.max_quantity_month,
        max_orders_simultaneosly: detail.max_orders_simultaneosly,
        delay: detail.delay/60000,
        enabled: detail.enabled
    })

    const [bankOptions, setBankOptions] = useState([])
    const [paymentSystemOptions, setPaymentSystemOptions] = useState([])
    const [inflowCurrencyVisible, setInflowCurrencyVisible] = useState(false)
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [bankError, setBankError] = useState(null);
    const [banksCache, setBanksCache] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
      currency: '',
      payment_system: '',
      bank_code: '',
      card_number: '',
      phone: '',
      owner: '',
    });

    const validateForm = () => {
      let isValid = true;
      const newErrors = {
        currency: '',
        payment_system: '',
        bank_code: '',
        card_number: '',
        phone: '',
        owner: '',
      };
    
      // Проверка основных полей
      if (!form.currency) {
        newErrors.currency = 'Выберите валюту';
        isValid = false;
      }
      
      if (!form.payment_system) {
        newErrors.payment_system = 'Выберите способ оплаты';
        isValid = false;
      }
      
      if (!form.bank_code) {
        newErrors.bank_code = 'Выберите банк';
        isValid = false;
      }
      
      if (!form.owner.trim()) {
        newErrors.owner = 'Введите имя владельца';
        isValid = false;
      }
    
      // Проверка полей в зависимости от платежной системы
      if (form.payment_system === 'C2C') {
        if (!form.card_number) {
          newErrors.card_number = 'Введите номер карты';
          isValid = false;
        } else if (form.card_number.length !== 16) {
          newErrors.card_number = 'Номер карты должен содержать 16 цифр';
          isValid = false;
        }
      }
      
      if (form.payment_system === 'SBP' || 
          form.payment_system === 'SBP_TJK' || 
          form.payment_system === 'TRANSGRAN') {
        if (!form.phone) {
          newErrors.phone = 'Введите номер телефона';
          isValid = false;
        } else if (form.phone.length !== 12) {
          newErrors.phone = 'Номер телефона должен быть в формате +7XXXXXXXXXX';
          isValid = false;
        }
      }
    
      setErrors(newErrors);
      return isValid;
    };

    const filteredBanks = useMemo(() => {
      if (!searchQuery) return bankOptions;
      
      return bankOptions.filter(bank => 
        bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bank.nspkCode && bank.nspkCode.includes(searchQuery))
      );
    }, [bankOptions, searchQuery]);

     // Функция для загрузки банков с бэкенда
     const fetchBanks = async (currency, paymentSystem) => {
       const cacheKey = `${currency}_${paymentSystem}`;
       if (banksCache[cacheKey]) {
        setBankOptions(banksCache[cacheKey]);
        return;
       }
       setLoadingBanks(true);
       setBankError(null);
       
       try {
           let params = { currency };
           
           // Для рублевых трансграничных переводов добавляем специальный флаг
           if (currency === 'RUB' && paymentSystem === 'TRANSGRAN') {
               params.is_transgran = true;
           }
           
           const response = await api.get('/merchant/banks', { params });
           setBankOptions(response.data);
           setBanksCache(prev => ({
            ...prev,
            [cacheKey]: response.data
           }));
       } catch (error) {
           console.error("Ошибка при загрузке банков:", error);
           setBankError("Не удалось загрузить список банков");
           setBankOptions([]);
       } finally {
           setLoadingBanks(false);
       }
    };

    useEffect(() => {
        switch (form.currency) {
            case 'RUB':
                setPaymentSystemOptions([
                    {
                        value: "SBP",
                        name: "СБП"
                    },
                    {
                        value: "C2C",
                        name: "Перевод на карту"
                    },
                    // {
                    //     value: "TRANSGRAN",
                    //     name: "Трансграничный перевод"
                    // }
                ])
                // setForm(prev => ({ ...prev, bank_name: "" }));
                setForm(prev => ({...prev, payment_system: ""}))
                break;
            case 'TJS':
                setPaymentSystemOptions([
                    {
                        value: "C2C_TJK",
                        name: "Перевод на карту"
                    },
                    {
                        value: "ACCOUNT_NUMBER_TJK",
                        name: "По номеру счёта"
                    }
                ])
                // setBankOptions(tajikBanks)
                // setForm(prev => ({ ...prev, bank_name: "" }));
                setForm(prev => ({...prev, payment_system: ""}))
                break;
            default:
                setPaymentSystemOptions([])
                setForm(prev => ({...prev, payment_system: ""}))
                // setBankOptions([])
                // setForm(prev => ({ ...prev, bank_name: "" }));
                break
        }
        console.log(paymentSystemOptions)
    }, [form.currency])

    useEffect(() => {
        switch (form.payment_system) {
            case 'TRANSGRAN':
                setInflowCurrencyVisible(true)
                setForm(prev => ({...prev, inflow_currency: ""}))
                break
            case '':
                setForm(prev => ({...prev, inflow_currency: 'RUB'}))
                setInflowCurrencyVisible(false)
                break
            case 'SBP':
                setForm(prev => ({...prev, inflow_currency: 'RUB'}))
                setInflowCurrencyVisible(false)
                break
                case 'C2C':
                  setForm(prev => ({...prev, inflow_currency: 'RUB'}))
                  setInflowCurrencyVisible(false)
                  break                 
            case 'C2C_TJK':
                setForm(prev => ({...prev, inflow_currency: 'TJK'}))
                setInflowCurrencyVisible(false)
                break
            default:
                setForm(prev => ({...prev, inflow_currency: ''}))
                setInflowCurrencyVisible(false)
                break
        }
    }, [form.payment_system])

    useEffect(() => {
      if (form.inflow_currency && form.payment_system) {
        setSearchQuery(''); // Сбрасываем поисковый запрос
        fetchBanks(form.inflow_currency, form.payment_system);
      } else {
        setBankOptions([]);
      }
    }, [form.inflow_currency, form.payment_system]);

    useEffect(() => {
      if (!isOpen) {
        setSearchQuery('');
      }
    }, [isOpen]);

    const handleOnChange = (e) => {
      const { name, type, value, checked, selectedOptions } = e.target;
    
      if (name === "bank_code") {
        const selected = selectedOptions[0];
        const selectedName = selected.getAttribute("data-name");
        const selectedNspk = selected.getAttribute("data-nspk");
    
        setForm((prev) => ({
          ...prev,
          bank_code: value,
          bank_name: selectedName,
          nspk_code: selectedNspk,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        }));
      }
      const fieldName = e.target.name;
      if (errors[fieldName]) {
        setErrors(prev => ({...prev, [fieldName]: ''}));
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Валидация формы
      if (!validateForm()) {
        toast.error('Пожалуйста, заполните все обязательные поля правильно');
        return;
      }
      
      try {
        setLoading(true);
        await updateBankDetail(form);
        onSuccess();
        onClose();
      } catch (error) {
        console.error('Ошибка при редактировании реквизита:', error);
        toast.error('Не удалось отредактировать реквизит');
      } finally {
        setLoading(false);
      }
    };

    const handleSearchKeyDown = (e) => {
      if (e.key === 'Enter' && filteredBanks.length > 0) {
        // Выбираем первый банк из результатов поиска
        const firstBank = filteredBanks[0];
        setForm(prev => ({
          ...prev,
          bank_code: firstBank.code,
          bank_name: firstBank.name,
          nspk_code: firstBank.nspkCode
        }));
        
        // Фокусируемся на селекте
        document.getElementById('bank_code').focus();
      }
    };

    const formatPhoneNumber = (value) => {
      // Оставляем только цифры
      const cleaned = value.replace(/\D/g, '');
      
      // Ограничиваем длину (1 - код страны, 10 - номер)
      const limited = cleaned.substring(0, 11);
      
      // Форматируем в человекочитаемый вид
      const match = limited.match(/^(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
      
      if (!match) return '';
      
      return [
        '+7',
        match[2] ? `(${match[2]}` : '',
        match[3] ? `)${match[3]}` : '',
        match[4] ? `-${match[4]}` : '',
        match[5] ? `-${match[5]}` : ''
      ].join('');
    };
  
    // Обработчик изменений для телефонного номера
    const handlePhoneChange = (e) => {
      const rawValue = e.target.value.replace(/\D/g, '');
      const phoneValue = rawValue.startsWith('7') || rawValue.startsWith('8') 
        ? `+7${rawValue.substring(1, 11)}` 
        : `+7${rawValue.substring(0, 10)}`;
      
      setForm(prev => ({
        ...prev,
        phone: phoneValue
      }));
      if (errors.phone) {
        setErrors(prev => ({...prev, phone: ''}));
      }
    };

      // Обработчик изменений для номера карты
      const handleCardNumberChange = (e) => {
        // Удаляем все нецифровые символы
        const rawValue = e.target.value.replace(/\D/g, '');
        // Ограничиваем длину 16 цифрами
        const cardValue = rawValue.substring(0, 16);

        setForm(prev => ({
          ...prev,
          card_number: cardValue
        }));
        if (errors.card_number) {
          setErrors(prev => ({...prev, card_number: ''}));
        }
      };
    
      // Форматирование номера карты для отображения
      const formatCardNumber = (value) => {
        return value.replace(/(\d{4})/g, '$1 ').trim();
      };

    return (
        <div className="modal-overlay">
        <div className="bank-modal">
            <div className="bank-modal-header">
                <h2>Редактировать реквизит</h2>
                <button className="modal-close-btn" onClick={onClose}>×</button>
            </div>
            <div className="bank-modal-body">
            <form onSubmit={handleSubmit} className="bank-modal-form">
                <div className="bank-modal-row">
                    <label htmlFor="currency">Валюта</label>
                    <select 
                        name="currency"
                        id="currency"
                        type="text"
                        value={form.currency}
                        onChange={handleOnChange}
                        className={errors.currency ? 'error-input' : ''}
                    >
                        <option value="">Выберите валюту</option>
                        <option value="RUB">RUB</option>
                        {/* <option value="TJS">TJS</option> */}
                    </select>
                    {errors.currency && <div className="error-message">{errors.currency}</div>}
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="payment_system">Способ оплаты</label>
                    <select
                        name="payment_system"
                        id="payment_system"
                        type="text"
                        value={form.payment_system}
                        onChange={handleOnChange}
                        disabled={form.currency == ""}
                    >
                        <option value="">Выберите способ оплаты</option>
                        {
                            paymentSystemOptions.map((paymentSystem) => (
                                <option 
                                    key={paymentSystem.value}
                                    value={paymentSystem.value}
                                >
                                    {paymentSystem.name}
                                </option>
                            ))
                        }
                    </select>
                </div>

                {inflowCurrencyVisible && <div className="bank-modal-row">
                    <label htmlFor="inflow_currency">Валюта поступления</label>
                    <select
                        name="inflow_currency"
                        id="inflow_currency"
                        type="text"
                        value={form.inflow_currency}
                        onChange={handleOnChange}
                        
                    >
                        <option value="">Выберите валюту</option>
                        <option value="RUB">RUB</option>
                        <option value="TJS">TJS</option>
                    </select>
                </div>}

                <div className="bank-modal-row">
                    <label htmlFor="bank_code">Банк</label>

                    <div className="bank-search-container">
                      <input
                        type="text"
                        placeholder="Поиск банка..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={loadingBanks || bankOptions.length === 0}
                        className="bank-search-input"
                        onKeyDown={handleSearchKeyDown}
                      />

                      <span className="search-icon">🔍</span>

                      {loadingBanks && (
                        <div className="loading-indicator">
                          <span className="spinner"></span>
                        </div>
                      )}
                    </div>

                    <select
                        name="bank_code"
                        id="bank_code"
                        value={form.bank_code}
                        onChange={handleOnChange}
                        disabled={loadingBanks || bankOptions.length === 0}
                        className="bank-select"
                     >
                        <option value="">Выберите банк</option>
                        
                        {loadingBanks ? (
                            <option value="" disabled>Загрузка банков...</option>
                        ) : bankError ? (
                            <option value="" disabled>{bankError}</option>
                        ) : (
                            bankOptions.map((bank) => (
                                <option 
                                    key={bank.code} 
                                    value={bank.code}
                                    data-name={bank.name}
                                    data-nspk={bank.nspkCode}
                                >
                                    {bank.name}
                                </option>
                            ))
                        )}
                    </select>
                    
                    {loadingBanks && (
                        <div className="loading-indicator">
                            <span className="spinner"></span>
                        </div>
                    )}
                </div>

                {(form.payment_system === 'C2C') && <div className="bank-modal-row">
                  <label htmlFor="card_number">Номер карты</label>
                  <input
                    name="card_number"
                    id="card_number"
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={formatCardNumber(form.card_number)}
                    onChange={handleCardNumberChange}
                    inputMode="numeric"
                    pattern="[0-9\s]{13,19}"
                    className={errors.card_number ? 'error-input' : ''}
                  />
                  {errors.card_number && <div className="error-message">{errors.card_number}</div>}
                </div>}

                { (form.payment_system === 'SBP' || form.payment_system === 'SBP_TJK' || form.payment_system === 'TRANSGRAN' && form.currency === 'RUB' && form.inflow_currency === 'TJS') 
                && <div className="bank-modal-row">
                      <label>Номер телефона</label>
                      <input
                        name="phone"
                        id="phone"
                        type="text"
                        placeholder="+7 (___) ___-__-__"
                        value={formatPhoneNumber(form.phone)}
                        onChange={handlePhoneChange}
                        className={errors.phone ? 'error-input' : ''}
                      />
                          {errors.phone && <div className="error-message">{errors.phone}</div>}
                    </div>}

                <div className="bank-modal-row">
                    <label htmlFor="owner">Имя владельца</label>
                    <input
                        name="owner"
                        id="owner"
                        type="text"
                        value={form.owner}
                        onChange={handleOnChange}
                        className={errors.owner ? 'error-input' : ''}
                    />
                      {errors.owner && <div className="error-message">{errors.owner}</div>}
                </div>
                <h2>Лимиты</h2>
                <div className="bank-modal-row">
                    <label htmlFor="min_amount">Мин сумма сделки</label>
                    <input
                        name="min_amount"
                        id="min_amount"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.min_amount}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_amount">Макс сумма сделки</label>
                    <input
                        name="max_amount"
                        id="max_amount"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.max_amount}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_amount_day">Сумма (день)</label>
                    <input
                        name="max_amount_day"
                        id="max_amount_day"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.max_amount_day}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_amount_month">Сумма (месяц)</label>
                    <input
                        name="max_amount_month"
                        id="max_amount_month"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.max_amount_month}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_quantity_day">Макс кол-во сделок (день)</label>
                    <input
                        name="max_quantity_day"
                        id="max_quantity_day"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.max_quantity_day}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_quantity_month">Макс кол-во сделок (месяц)</label>
                    <input
                        name="max_quantity_month"
                        id="max_quantity_month"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.max_quantity_month}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_orders_simultaneosly">Сделок одновременно</label>
                    <input
                        name="max_orders_simultaneosly"
                        id="max_orders_simultaneosly"
                        type="number"
                        min={0}
                        max={10000}
                        value={form.max_orders_simultaneosly}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="delay">Задержка между сделками(мин)</label>
                    <input
                        name="delay"
                        id="delay"
                        type="number"
                        min={0}
                        max={100000}
                        value={form.delay}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="enabled">Активность</label>
                    <input
                        name="enabled"
                        id="enabled"
                        type="checkbox"
                        checked={form.enabled}
                        onChange={handleOnChange}
                    />
                </div>

                <button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span> Сохранение...
                    </>
                  ) : (
                    'Сохранить'
                  )}
                </button>
                <button type="button" onClick={onClose}>Выйти</button>
            </form>
            </div>
        </div>
        </div>
    )
}

export default EditbankDetailsModal