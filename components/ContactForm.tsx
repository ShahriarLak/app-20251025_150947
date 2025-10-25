'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import clsx from 'clsx'

// Validation schema
const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
})

type ContactFormData = z.infer<typeof contactSchema>

type SubmissionState = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur'
  })

  const onSubmit = async (data: ContactFormData) => {
    setSubmissionState('loading')
    setErrorMessage('')

    try {
      // Simulate API call
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setSubmissionState('success')
      reset()
      
      // Reset success state after 5 seconds
      setTimeout(() => {
        setSubmissionState('idle')
      }, 5000)

    } catch (error) {
      console.error('Contact form error:', error)
      setSubmissionState('error')
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred. Please try again.'
      )
      
      // Reset error state after 5 seconds
      setTimeout(() => {
        setSubmissionState('idle')
        setErrorMessage('')
      }, 5000)
    }
  }

  const isLoading = submissionState === 'loading'
  const isSuccess = submissionState === 'success'
  const isError = submissionState === 'error'

  if (isSuccess) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 animate-fade-in">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Message Sent Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
          <button
            onClick={() => setSubmissionState('idle')}
            className="btn-primary"
          >
            Send Another Message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Send us a Message
      </h2>

      {isError && (
        <div className="error-alert mb-6 animate-fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="mt-1">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            autoComplete="name"
            className={clsx(
              'input-field',
              errors.name && 'input-error'
            )}
            placeholder="Enter your full name"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="error-message">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            autoComplete="email"
            className={clsx(
              'input-field',
              errors.email && 'input-error'
            )}
            placeholder="Enter your email address"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="error-message">{errors.email.message}</p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            {...register('message')}
            id="message"
            rows={6}
            className={clsx(
              'input-field resize-none',
              errors.message && 'input-error'
            )}
            placeholder="Tell us about your project or question..."
            disabled={isLoading}
          />
          {errors.message && (
            <p className="error-message">{errors.message.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4 text-center">
        * Required fields. We'll never share your information with third parties.
      </p>
    </div>
  )
}