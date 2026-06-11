import axios from 'axios';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PaymentTransaction } from '../types';
import CryptoJS from 'crypto-js';

const MERCHANT_ID = process.env.EXPO_PUBLIC_PAYTR_MERCHANT_ID ?? '';
const MERCHANT_KEY = process.env.EXPO_PUBLIC_PAYTR_MERCHANT_KEY ?? '';
const MERCHANT_SALT = process.env.EXPO_PUBLIC_PAYTR_MERCHANT_SALT ?? '';

export const paymentService = {
  async createPayTRPayment(params: {
    merchantOid: string;
    email: string;
    paymentAmount: number;
    userIp: string;
    userName: string;
    userAddress: string;
    userPhone: string;
    itemsJson: string;
  }): Promise<string> {
    const {
      merchantOid,
      email,
      paymentAmount,
      userIp,
      userName,
      userAddress,
      userPhone,
      itemsJson,
    } = params;

    const noInstallment = '0';
    const maxInstallment = '0';
    const currency = 'TL';
    const testMode = '1';
    const debugOn = '0';
    const timeoutLimit = '30';
    const paymentType = 'card';

    const hashStr = `${MERCHANT_ID}${userIp}${merchantOid}${email}${paymentAmount}${noInstallment}${maxInstallment}${currency}${testMode}`;
    const paytrToken = CryptoJS.HmacSHA256(hashStr + MERCHANT_SALT, MERCHANT_KEY).toString(
      CryptoJS.enc.Base64
    );

    const formData = new URLSearchParams();
    formData.append('merchant_id', MERCHANT_ID);
    formData.append('user_ip', userIp);
    formData.append('merchant_oid', merchantOid);
    formData.append('email', email);
    formData.append('payment_amount', String(paymentAmount));
    formData.append('paytr_token', paytrToken);
    formData.append('user_basket', Buffer.from(itemsJson).toString('base64'));
    formData.append('debug_on', debugOn);
    formData.append('no_installment', noInstallment);
    formData.append('max_installment', maxInstallment);
    formData.append('user_name', userName);
    formData.append('user_address', userAddress);
    formData.append('user_phone', userPhone);
    formData.append('merchant_ok_url', `${process.env.EXPO_PUBLIC_APP_URL}/payment/success`);
    formData.append('merchant_fail_url', `${process.env.EXPO_PUBLIC_APP_URL}/payment/fail`);
    formData.append('timeout_limit', timeoutLimit);
    formData.append('currency', currency);
    formData.append('test_mode', testMode);
    formData.append('payment_type', paymentType);

    const response = await axios.post('https://www.paytr.com/odeme/api/get-token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (response.data.status === 'success') {
      return response.data.token as string;
    }
    throw new Error(response.data.reason ?? 'PayTR token alınamadı');
  },

  verifyPayment(
    merchantOid: string,
    paymentAmount: string,
    currency: string,
    status: string
  ): boolean {
    const hashStr = `${merchantOid}${MERCHANT_SALT}${status}${paymentAmount}${currency}`;
    const hash = CryptoJS.HmacSHA256(hashStr, MERCHANT_KEY).toString(CryptoJS.enc.Base64);
    return hash === status;
  },

  async processEscrow(
    jobId: string,
    customerId: string,
    tradesmanId: string,
    amount: number
  ): Promise<PaymentTransaction> {
    const merchantOid = `JOB_${jobId}_${Date.now()}`;
    const docRef = await addDoc(collection(db, 'transactions'), {
      jobId,
      customerId,
      tradesmanId,
      amount,
      status: 'pending',
      merchantOid,
      createdAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      jobId,
      customerId,
      tradesmanId,
      amount,
      status: 'pending',
      merchantOid,
      createdAt: new Date(),
    };
  },

  async releasePayment(transactionId: string): Promise<void> {
    await updateDoc(doc(db, 'transactions', transactionId), {
      status: 'released',
      releasedAt: serverTimestamp(),
    });
  },

  async getTransactionsByJob(jobId: string): Promise<PaymentTransaction[]> {
    const snapshot = await getDocs(
      query(collection(db, 'transactions'), where('jobId', '==', jobId))
    );
    return snapshot.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        ...data,
        createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
      } as PaymentTransaction;
    });
  },
};
