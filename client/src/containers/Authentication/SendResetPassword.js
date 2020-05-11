import React, { useMemo } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { FormattedMessage as T, useIntl } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import { Button, InputGroup, Intent, FormGroup } from '@blueprintjs/core';
import { FormattedMessage } from 'react-intl';

import { compose } from 'utils';

import AppToaster from 'components/AppToaster';
import ErrorMessage from 'components/ErrorMessage';

import AuthInsider from 'containers/Authentication/AuthInsider';

import withAuthenticationActions from './withAuthenticationActions';

function SendResetPassword({ requestSendResetPassword }) {
  const { formatMessage } = useIntl();
  const history = useHistory();

  // Validation schema.
  const ValidationSchema = Yup.object().shape({
    crediential: Yup.string('')
      .required(formatMessage({ id: 'required' }))
      .email(formatMessage({ id: 'invalid_email_or_phone_numner' })),
  });

  const initialValues = useMemo(
    () => ({
      crediential: '',
    }),
    []
  );

  // Formik validation
  const {
    values,
    errors,
    touched,
    handleSubmit,
    getFieldProps,
    setFieldValue,
    isSubmitting,
  } = useFormik({
    enableReinitialize: true,
    validationSchema: ValidationSchema,
    initialValues: {
      ...initialValues,
    },
    onSubmit: (values, { setSubmitting }) => {
      requestSendResetPassword(values.crediential)
        .then((response) => {
          AppToaster.show({
            message: `Check your email for a link to reset your password.
              If it doesn’t appear within a few minutes, check your spam folder.`,
            intent: Intent.SUCCESS,
          });
          history.push('/auth/login');
          setSubmitting(false);
        })
        .catch((errors) => {
          if (errors.find((e) => e.type === 'EMAIL.NOT.REGISTERED')) {
            AppToaster.show({
              message: "We couldn't find your account with that email",
              intent: Intent.DANGER,
            });
          }
          setSubmitting(false);
        });
    },
  });

  return (
    <AuthInsider>
      <div class='reset-form'>
        <div className={'authentication-page__label-section'}>
          <h3>
            <T id={'reset_your_password'} />
          </h3>
          <p>
            <T id={'we_ll_send_you_a_link_to_reset_your_password'} />
          </p>
        </div>

        <form onSubmit={handleSubmit} className={'send-reset-password'}>
          <FormGroup
            label={'Email or Phone Number'}
            intent={errors.crediential && touched.crediential && Intent.DANGER}
            helperText={
              <ErrorMessage name={'crediential'} {...{ errors, touched }} />
            }
            className={'form-group--crediential'}
          >
            <InputGroup
              intent={
                errors.crediential && touched.crediential && Intent.DANGER
              }
              large={true}
              {...getFieldProps('crediential')}
            />
          </FormGroup>

          <div className={'authentication-page__submit-button-wrap'}>
            <Button
              type={'submit'}
              intent={Intent.PRIMARY}
              fill={true}
              loading={isSubmitting}
            >
              <T id={'send_password_reset_link'} />
            </Button>
          </div>
        </form>

        <div class='authentication-page__footer-links'>
          <Link to='/auth/login'>
            <T id={'return_to_log_in'} />
          </Link>
        </div>
      </div>
    </AuthInsider>
  );
}

export default compose(withAuthenticationActions)(SendResetPassword);
