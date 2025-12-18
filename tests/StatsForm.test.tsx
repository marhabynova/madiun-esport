/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import StatsForm, { StatDefinition } from '../app/components/StatsForm'

describe('StatsForm UI', () => {
    test('renders inputs and submits values', async () => {
        const stats = [
            { key: 'kills', label: 'Kills', type: 'number', required: true },
            { key: 'mvp', label: 'MVP', type: 'boolean' },
            { key: 'role', label: 'Role', type: 'select', options: ['Top', 'Mid'] },
        ]

        const user = userEvent.setup()
        const onSubmit = jest.fn()

        render(<StatsForm stats={stats as unknown as StatDefinition[]} onSubmit={onSubmit} />)

        // fill number (spinbutton role)
        const kills = screen.getByRole('spinbutton') as HTMLInputElement
        await user.clear(kills)
        await user.type(kills, '5')

        // toggle mvp
        const mvp = screen.getByRole('checkbox') as HTMLInputElement
        await user.click(mvp)

        // select role
        const select = screen.getByRole('combobox') as HTMLSelectElement
        await user.selectOptions(select, 'Mid')

        // submit
        const button = screen.getByRole('button', { name: /submit/i })
        await user.click(button)

        expect(onSubmit).toHaveBeenCalled()
        const submitted = onSubmit.mock.calls[0][0]
        expect(submitted.kills).toBe(5)
        expect(submitted.mvp).toBe(true)
        expect(submitted.role).toBe('Mid')
    })
})
